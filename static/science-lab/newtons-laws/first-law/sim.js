/* Newton's Laws, Chapter 1 (Inertia): the page. Galileo's two ramps (main simulation), a probe coasting in deep space,
   and four small inertia demos. The physics is in physics.js (window.NL1Phys), in SI units. */
(function () {
  'use strict';
  var LAB = window.TRBLab, P = window.NL1Phys;
  var root = document.getElementById('nl1-lab');
  if (!root || !LAB || !P) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced, D2R = Math.PI / 180;
  var C = { bg: '#06111a', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', faint: 'rgba(120,170,200,.12)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', white: '#ffffff' };
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
  var toastQ = [], toastAt = -10;
  function sayIn(v, text) { toastQ.push([v, text]); pump(); }
  function pump() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.8) { toastAt = now; var q = toastQ.shift(); LAB.toast(q[0], q[1]); } }
  setInterval(pump, 400);
  function ensureVisible(v) { var r = v.getBoundingClientRect(), H = window.innerHeight || 800, seen = Math.min(r.bottom, H) - Math.max(r.top, 0); if (seen < 0.7 * Math.min(r.height, H)) v.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }

  // =====================================================================================
  // 1. Galileo's two ramps
  // =====================================================================================
  var view = $('nl1-view'), cv = $('nl1-cv'), K = LAB.canvas(cv), ctx = K.c;
  var SURF = {
    carpet: { C: 0.05, name: 'Rough carpet', col: '#c2547a', glow: '#f9a8d4' },
    wood: { C: 0.015, name: 'Wood floor', col: '#c99a5b', glow: '#ffd479' },
    ice: { C: 0.004, name: 'Ice', col: '#a5d8ff', glow: '#74c0fc' },
    none: { C: 0, name: 'No friction', col: '#63e6be', glow: '#63e6be' }
  };
  var SPEEDS = [0.25, 0.5, 1, 2, 4, 8], SPEED_TXT = ['¼×', '½×', '1×', '2×', '4×', '8×'];
  var RB = 0.07;                    // the ball's radius as drawn, m
  var FLAG = 4;                     // the flag on the flat, m from the middle of the bottom
  var R = { h0: 0.5, aR: 30, surf: 'none', speedIx: 2, paused: false, run: null, cam: 0, acc: 0, drag: null, touched: false, flash: 0 };
  var el = { h: $('nl1-h'), hO: $('nl1-h-o'), ang: $('nl1-ang'), angO: $('nl1-ang-o'), angSeg: $('nl1-angs'), surf: $('nl1-surf'), surfNote: $('nl1-surf-note'), go: $('nl1-go'), read: $('nl1-read'), hud: $('nl1-hud'), pause: $('nl1-pause'), speed: $('nl1-speed'), reset: $('nl1-reset') };

  var MISSIONS = [
    { id: 'same', title: 'Same height', goal: 'With no friction, let the ball roll up the right ramp. How high does it climb?' },
    { id: 'carpet', title: 'Rough going', goal: 'Put the ball on rough carpet. Does it still get back to its starting height?' },
    { id: 'lower', title: 'Lower the ramp', goal: 'No friction, right ramp at 10° or less: watch the ball roll at least 3 m up it.' },
    { id: 'forever', title: 'Flat forever', goal: 'Make the right side flat, take friction away, and let the ball roll 50 m.' },
    { id: 'trips', title: 'Ten trips', goal: 'With no friction, let the ball roll back and forth until it has turned around 10 times.' },
    { id: 'ice', title: 'Even ice', goal: 'On ice, on the flat, let the ball roll until it stops. (Try 8× speed.)' },
    { id: 'flag', title: 'Stop at the flag', goal: 'With any friction, flatten the right side and make the ball stop within 10 cm of the flag at 4 m.' }
  ];
  var TITLE = {}; MISSIONS.forEach(function (m) { TITLE[m.id] = m.title; });
  var PICK = {
    same: function () { setAll(0.5, 30, 'none', 2); sayIn(view, 'No friction. The dashed gold line marks the starting height.'); },
    carpet: function () { setAll(0.8, 30, 'carpet', 2); sayIn(view, 'Rough carpet. Where does the ball turn around this time?'); },
    lower: function () { setAll(0.5, 8, 'none', 3); sayIn(view, 'The right ramp is only 8° steep. Playing at 2×.'); },
    forever: function () { setAll(0.5, 0, 'none', 4); sayIn(view, 'Flat and frictionless. Playing at 4×.'); },
    trips: function () { setAll(0.6, 45, 'none', 3); sayIn(view, 'Count the turnarounds in the box at the top left.'); },
    ice: function () { setAll(0.5, 0, 'ice', 5); sayIn(view, 'Ice, at 8×. Keep an eye on the speed graph.'); },
    flag: function () { setAll(0.4, 0, 'carpet', 2); sayIn(view, 'Change the start height until the ball stops at the flag. Drag the ball up or down the ramp.'); }
  };
  var MS = LAB.missions($('nl1-missions'), 'nl-first-law', MISSIONS, function (id) { toastQ = []; toastAt = -10; R.touched = true; if (PICK[id]) PICK[id](); ensureVisible(view); });
  function win(id, text) { if (MS.done(id)) { sayIn(view, '✓ ' + TITLE[id] + '! ' + text); R.flash = 1; } }

  function newRun() {
    var tr = new P.Track({ aL: 30 * D2R, aR: R.aR * D2R, flat: 0.6, R: 0.3, Htop: 1.2, HR: 1.3 });
    var b = new P.Ball(tr, R.h0, SURF[R.surf].C);
    R.run = { tr: tr, b: b, turns: 0, marks: [], trail: [], graph: [[0, 0]], gClock: 0, tClock: 0, E0: b.energy(), lastTurnH: NaN, lastTurnD: NaN, checked: {} };
    R.acc = 0;
  }
  function setAll(h0, aR, surf, speedIx) {
    R.h0 = h0; R.aR = aR; R.surf = surf; if (speedIx !== undefined) setSpeed(speedIx);
    el.h.value = h0; el.ang.value = aR; outputs(); newRun(); setPaused(false);
  }
  function outputs() {
    el.hO.textContent = fmt(R.h0, 2) + ' m';
    el.angO.textContent = R.aR === 0 ? 'flat (0°)' : R.aR + '°';
    pressSeg(el.angSeg, 'ang', R.aR); pressSeg(el.surf, 'surf', R.surf);
    var s = SURF[R.surf];
    el.surfNote.textContent = s.C ? s.name + ': rolling resistance is ' + fmt(s.C * 100, 1) + '% of the ball’s weight, so on the flat it loses ' + fmt(s.C * P.G / P.BETA, 3) + ' m/s of speed every second.' : 'No friction at all: nothing on the track can slow the ball down.';
  }
  function setSpeed(i) { R.speedIx = clamp(i, 0, SPEEDS.length - 1); el.speed.textContent = SPEED_TXT[R.speedIx]; el.speed.setAttribute('aria-label', 'Playback speed ' + SPEED_TXT[R.speedIx].replace('×', ' times') + '. Press to change.'); }
  function setPaused(p) { R.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
  function changed() { R.touched = true; outputs(); newRun(); }

  el.h.addEventListener('input', function () { R.h0 = +el.h.value; changed(); });
  el.ang.addEventListener('input', function () { R.aR = +el.ang.value; changed(); });
  el.angSeg.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; R.aR = +b.dataset.ang; el.ang.value = R.aR; changed(); });
  el.surf.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; R.surf = b.dataset.surf; changed(); });
  el.go.addEventListener('click', function () { newRun(); setPaused(false); });
  el.pause.addEventListener('click', function () { setPaused(!R.paused); });
  el.speed.addEventListener('click', function () { setSpeed((R.speedIx + 1) % SPEEDS.length); });
  el.reset.addEventListener('click', function () { newRun(); setPaused(false); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'ArrowUp' || k === 'ArrowDown') { R.h0 = clamp(Math.round((R.h0 + (k === 'ArrowUp' ? 0.05 : -0.05)) * 100) / 100, 0.1, 1.1); el.h.value = R.h0; changed(); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { R.aR = clamp(R.aR + (k === 'ArrowRight' ? 5 : -5), 0, 60); el.ang.value = R.aR; changed(); }
    else if (k === ' ') setPaused(!R.paused);
    else if (k === 'r' || k === 'R') { newRun(); setPaused(false); }
    else used = false;
    if (used) e.preventDefault();
  });

  // ---- geometry on screen ----
  var GEO = {};
  function layout() {
    var W = K.w, H = K.h, gh = clamp(H * 0.3, 112, 170), sceneH = H - gh - 8;
    var S = Math.min(W < 600 ? W / 3.3 : W / 5.6, (sceneH - 50) / 1.3);
    GEO = { W: W, H: H, gh: gh, sceneH: sceneH, S: S, Y0: sceneH - 30, half: W / 2 / S };
  }
  function sx(x) { return GEO.W / 2 + (x - R.cam) * GEO.S; }
  function sy(y) { return GEO.Y0 - y * GEO.S; }
  function wx(px) { return (px - GEO.W / 2) / GEO.S + R.cam; }
  function wy(py) { return (GEO.Y0 - py) / GEO.S; }
  function ballCenter(tr, s) { var p = tr.pos(s), th = tr.theta(s); return { x: p.x - RB * Math.sin(th), y: p.y + RB * Math.cos(th) }; }
  function rampHandle(tr) {
    if (R.aR > 0) { var a = R.aR * D2R, len = Math.min(tr.segs[4].len, 1.9 / Math.cos(a), 0.95 / Math.sin(a)); return tr.pos(tr.sRightRamp + len); }
    return { x: 2.2, y: 0 };
  }

  // ---- pointer: drag the ball up or down the left ramp, or the right ramp's handle to change its angle ----
  function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function hitWhat(p) {
    var run = R.run, bc = ballCenter(run.tr, run.b.s), hd = rampHandle(run.tr);
    if (Math.hypot(p.x - sx(hd.x), p.y - (sy(hd.y) - 14)) < 30) return 'ramp';
    if (Math.hypot(p.x - sx(bc.x), p.y - sy(bc.y)) < 30 || (p.x < sx(-0.35) && p.y < GEO.sceneH)) return 'ball';
    return null;
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = ptr(e), w = hitWhat(p); if (!w) return;
    R.drag = w; R.touched = true; cv.setPointerCapture(e.pointerId); e.preventDefault(); moveDrag(p);
  });
  cv.addEventListener('pointermove', function (e) { var p = ptr(e); if (R.drag) moveDrag(p); else cv.style.cursor = hitWhat(p) ? 'grab' : 'default'; });
  function endDrag() { if (R.drag) { R.drag = null; newRun(); setPaused(false); } }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  function moveDrag(p) {
    if (R.drag === 'ball') {
      var y = wy(p.y) - RB; R.h0 = clamp(Math.round(y * 100) / 100, 0.1, 1.1); el.h.value = R.h0; outputs(); newRun();
    } else if (R.drag === 'ramp') {
      var a = Math.atan2(wy(p.y + 14), wx(p.x) - 0.3) / D2R; a = clamp(Math.round(a), 0, 60); if (a < 1.5) a = 0;
      if (a !== R.aR) { R.aR = a; el.ang.value = a; outputs(); newRun(); }
    }
  }

  // ---- stepping and missions ----
  function stepRun(dt) {
    var run = R.run, b = run.b, tr = run.tr, H = 1e-3, n = 0;
    if (R.drag) return;
    R.acc += dt * SPEEDS[R.speedIx];
    while (R.acc >= H && n < 1200) {
      R.acc -= H; n++;
      var ev = b.step(H);
      if (ev) onEvent(ev);
      if (!b.moving) { R.acc = 0; break; }
    }
    if (n >= 1200) R.acc = 0;
    run.gClock += n * H; run.tClock += n * H;
    if (run.gClock >= 1 / 30) { run.gClock = 0; run.graph.push([b.t, Math.abs(b.v)]); if (run.graph.length > 4000) run.graph.splice(0, 1000); }
    if (run.tClock >= 1 / 24 && n) { run.tClock = 0; var c = ballCenter(tr, b.s); run.trail.push([c.x, c.y]); if (run.trail.length > 70) run.trail.shift(); }
    if (!b.moving) { var lastG = run.graph[run.graph.length - 1]; if (lastG[0] < b.t - 0.2) run.graph.push([b.t, 0]); b.t += dt * SPEEDS[R.speedIx]; }
    var x = tr.pos(b.s).x;
    if (R.aR === 0 && SURF[R.surf].C === 0 && x >= 50 && !run.checked.forever) { run.checked.forever = true; win('forever', fmt(x, 0) + ' m and still ' + fmt(Math.abs(b.v), 2) + ' m/s. With nothing to slow it, it never stops.'); }
  }
  function onEvent(ev) {
    var run = R.run, b = run.b, tr = run.tr, p = tr.pos(b.s), C0 = SURF[R.surf].C;
    if (ev === 'turn' || (ev === 'stop' && R.aR > 0 && p.x > 0.4)) {
      run.turns++;
      run.marks.push({ x: p.x, y: p.y }); if (run.marks.length > 4) run.marks.shift();
      if (p.x > 0.3 && R.aR > 0) {
        var dUp = b.s - tr.sRightRamp;
        run.lastTurnH = p.y; run.lastTurnD = dUp;
        if (C0 === 0 && p.y >= 0.995 * b.h0) win('same', 'It climbed back to ' + fmt(p.y, 3) + ' m, the height it started from.');
        if (C0 >= 0.03 && p.y < 0.9 * b.h0) win('carpet', 'Only ' + fmt(p.y, 2) + ' m of ' + fmt(b.h0, 2) + ' m. Friction turned part of the motion into heat.');
        if (C0 === 0 && R.aR <= 10 && dUp >= 3) win('lower', 'It rolled ' + fmt(dUp, 1) + ' m up an ' + R.aR + '° ramp to get back to ' + fmt(p.y, 2) + ' m.');
      }
      if (C0 === 0 && run.turns >= 10) win('trips', 'Ten turnarounds, and the ball still reaches ' + fmt(p.y, 3) + ' m. Nothing has been lost.');
    }
    if (ev === 'stop' && R.aR === 0 && C0 > 0) {
      var dist = p.x;
      if (C0 < 0.01 && dist > 20) win('ice', 'It stopped after ' + fmt(dist, 0) + ' m. Ice has a little friction, so the ball stops too, eventually.');
      if (Math.abs(dist - FLAG) <= 0.1) win('flag', 'Stopped ' + fmt(Math.abs(dist - FLAG) * 100, 0) + ' cm from the flag.');
      else if (dist > 0.3 && dist < 12 && !MS.isDone('flag')) sayIn(view, 'Stopped at ' + fmt(dist, 2) + ' m. The flag is at 4 m: ' + (dist < FLAG ? 'start a little higher.' : 'start a little lower.'));
    }
  }

  // ---- drawing ----
  function trackPoints(tr, xr) {
    var pts = [];
    tr.segs.forEach(function (g) {
      if (g.type === 'arc') { for (var i = 0; i <= 14; i++) pts.push(tr.pos(g.s0 + g.len * i / 14)); }
      else { pts.push(tr.pos(g.s0)); var len = g.len; if (!isFinite(len)) len = Math.max(1, xr - g.x0); pts.push(tr.pos(g.s0 + len - 1e-9)); }
    });
    return pts;
  }
  function drawRamps(dt) {
    K.fit(); layout();
    var W = GEO.W, H = GEO.H, run = R.run, tr = run.tr, b = run.b, s = SURF[R.surf], half = GEO.half;
    // camera: keep the ball in view; at the start the left ramp's top is in view
    var bc = ballCenter(tr, b.s), camMin = Math.min(0, -2.62 + half);
    var target = Math.max(camMin, bc.x - 0.25 * half);
    R.cam = (reduced || R.drag) ? target : lerp(R.cam, target, clamp(dt * 4, 0, 1));
    if (Math.abs(R.cam - target) > 3 * half) R.cam = target;
    ctx.clearRect(0, 0, W, H);
    var g = ctx.createLinearGradient(0, 0, 0, GEO.sceneH); g.addColorStop(0, '#0b1d2d'); g.addColorStop(1, '#06111a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, GEO.sceneH);
    // faint grid every 0.5 m
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath();
    for (var gx = Math.floor(wx(0) * 2) / 2; gx < wx(W); gx += 0.5) { ctx.moveTo(Math.round(sx(gx)) + 0.5, 0); ctx.lineTo(Math.round(sx(gx)) + 0.5, GEO.Y0); }
    for (var gy = 0; gy <= 2.5; gy += 0.5) { ctx.moveTo(0, Math.round(sy(gy)) + 0.5); ctx.lineTo(W, Math.round(sy(gy)) + 0.5); }
    ctx.stroke();
    var pts = trackPoints(tr, wx(W) + 1), last = pts[pts.length - 1];
    // ground under the track
    ctx.beginPath(); ctx.moveTo(sx(pts[0].x), GEO.sceneH);
    pts.forEach(function (q) { ctx.lineTo(sx(q.x), sy(q.y)); });
    ctx.lineTo(sx(last.x), GEO.sceneH); ctx.closePath();
    var gg = ctx.createLinearGradient(0, sy(1.2), 0, GEO.sceneH); gg.addColorStop(0, hexA(s.col, 0.24)); gg.addColorStop(1, hexA(s.col, 0.04));
    ctx.fillStyle = gg; ctx.fill();
    // the surface line, glowing
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); pts.forEach(function (q, i) { if (i) ctx.lineTo(sx(q.x), sy(q.y)); else ctx.moveTo(sx(q.x), sy(q.y)); });
    if (!reduced) { ctx.shadowColor = s.glow; ctx.shadowBlur = 14; }
    ctx.strokeStyle = s.col; ctx.lineWidth = 4; ctx.stroke(); ctx.shadowBlur = 0;
    if (R.surf === 'carpet') { ctx.setLineDash([2, 5]); ctx.strokeStyle = 'rgba(255,220,235,.6)'; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    if (R.surf === 'ice') { ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
    // posts at the tops of the ramps
    ctx.fillStyle = '#2c4a60';
    var top = pts[0]; ctx.fillRect(sx(top.x) - 3, sy(top.y) - 4, 6, sy(0) - sy(top.y) + 4);
    if (isFinite(tr.L)) ctx.fillRect(sx(last.x) - 3, sy(last.y) - 4, 6, sy(0) - sy(last.y) + 4);
    // a flat right side: distance ticks and the flag
    if (R.aR === 0) {
      ctx.strokeStyle = C.line; ctx.lineWidth = 1;
      for (var d = Math.max(1, Math.floor(wx(0))); d < wx(W) + 1; d++) {
        var X = sx(d), big = d % 5 === 0; ctx.beginPath(); ctx.moveTo(X, sy(0) + 4); ctx.lineTo(X, sy(0) + (big ? 14 : 9)); ctx.stroke();
        if (big || GEO.S > 120) txt(ctx, d + ' m', X, sy(0) + 25, big ? C.ink : C.muted, (big ? '600 ' : '') + '11px system-ui,sans-serif', 'center');
      }
      var fX = sx(FLAG), fY = sy(0);
      if (fX > -30 && fX < W + 30) {
        ctx.fillStyle = 'rgba(255,135,135,.22)'; ctx.fillRect(sx(FLAG - 0.1), fY - 3, sx(FLAG + 0.1) - sx(FLAG - 0.1), 6);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fX, fY); ctx.lineTo(fX, fY - 46); ctx.stroke();
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(fX, fY - 46); ctx.lineTo(fX + 22, fY - 39); ctx.lineTo(fX, fY - 32); ctx.closePath(); ctx.fill();
      }
      if (s.C === 0) txt(ctx, 'the track goes on forever →', W - 12, sy(0) - 12, hexA(C.green, 0.85), 'italic 13px Georgia,serif', 'right');
    }
    // the start-height line
    var hy = sy(b.h0);
    ctx.save(); ctx.setLineDash([7, 6]); ctx.strokeStyle = hexA(C.gold, 0.75); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(40, hy); ctx.lineTo(W, hy); ctx.stroke(); ctx.restore();
    txt(ctx, 'start height ' + fmt(b.h0, 2) + ' m', W - 10, hy - 7, C.gold, '600 12px system-ui,sans-serif', 'right');
    // a height ruler on the left edge
    ctx.fillStyle = 'rgba(6,17,26,.7)'; ctx.fillRect(0, sy(1.25), 38, sy(0) - sy(1.25) + 6);
    ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(34.5, sy(0)); ctx.lineTo(34.5, sy(1.2)); ctx.stroke();
    for (var i = 0; i <= 12; i++) { var yy = Math.round(sy(i / 10)) + 0.5, maj = i % 5 === 0; ctx.beginPath(); ctx.moveTo(maj ? 26 : 30, yy); ctx.lineTo(34.5, yy); ctx.stroke(); if (maj) txt(ctx, fmt(i / 10, 1), 23, yy + 4, C.muted, '10px system-ui,sans-serif', 'right'); }
    txt(ctx, 'm', 23, sy(1.2) - 6, C.muted, '10px system-ui,sans-serif', 'right');
    // where the ball turned around
    run.marks.forEach(function (m) {
      var X = sx(m.x), Y = sy(m.y); if (X < -40 || X > W + 40) return;
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(X, Y, 4, 0, 7); ctx.fill();
      ctx.strokeStyle = hexA(C.pink, 0.6); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X, Y - 4); ctx.lineTo(X, Y - 24); ctx.stroke();
      txt(ctx, fmt(m.y, 3) + ' m', X, Y - 28, C.pink, '600 11px system-ui,sans-serif', 'center');
    });
    // the trail
    for (i = 0; i < run.trail.length; i++) {
      var q = run.trail[i], a = (i + 1) / run.trail.length;
      ctx.fillStyle = hexA(s.glow, 0.04 + 0.3 * a); ctx.beginPath(); ctx.arc(sx(q[0]), sy(q[1]), 2 + 3 * a, 0, 7); ctx.fill();
    }
    // the right ramp's handle
    var hd = rampHandle(tr), HX = sx(hd.x), HY = sy(hd.y) - 14;
    if (HX > -20 && HX < W + 20) {
      ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(255,212,121,.16)'; ctx.beginPath(); ctx.arc(HX, HY, 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      txt(ctx, '⇕', HX, HY + 5, C.gold, '13px system-ui,sans-serif', 'center');
      txt(ctx, R.aR === 0 ? 'drag to tilt' : R.aR + '°', HX, HY - 17, C.gold, '600 11px system-ui,sans-serif', 'center');
    }
    // the ball
    var BX = sx(bc.x), BY = sy(bc.y), r0 = Math.max(6, RB * GEO.S);
    ctx.save(); if (!reduced) { ctx.shadowColor = s.glow; ctx.shadowBlur = 18; }
    var bgr = ctx.createRadialGradient(BX - r0 * 0.35, BY - r0 * 0.4, r0 * 0.1, BX, BY, r0);
    bgr.addColorStop(0, '#ffffff'); bgr.addColorStop(0.35, '#9fe8d2'); bgr.addColorStop(1, '#1e7a62');
    ctx.fillStyle = bgr; ctx.beginPath(); ctx.arc(BX, BY, r0, 0, 7); ctx.fill(); ctx.restore();
    var phi = b.s / RB; ctx.strokeStyle = 'rgba(6,17,26,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(BX + Math.cos(phi) * r0 * 0.85, BY + Math.sin(phi) * r0 * 0.85); ctx.lineTo(BX - Math.cos(phi) * r0 * 0.85, BY - Math.sin(phi) * r0 * 0.85); ctx.stroke();
    // velocity arrow
    var th = tr.theta(b.s), vlen = b.v * GEO.S * 0.3;
    if (Math.abs(b.v) > 0.03) arrow(ctx, BX, BY - r0 - 8, BX + Math.cos(th) * vlen, BY - r0 - 8 - Math.sin(th) * vlen, C.white, 2.5, 9);
    if (!R.touched) { var hp = ballCenter(tr, tr.sAtHeightLeft(Math.min(1.0, b.h0 + 0.25))); txt(ctx, 'drag the ball up or down this ramp', Math.max(46, sx(hp.x) - 10), sy(hp.y) - 22, hexA(C.ink, 0.8), 'italic 12px Georgia,serif'); }
    if (R.flash > 0) { ctx.fillStyle = 'rgba(99,230,190,' + (0.16 * R.flash) + ')'; ctx.fillRect(0, 0, W, GEO.sceneH); R.flash = Math.max(0, R.flash - dt * 1.5); }
    drawGraph();
  }
  function drawGraph() {
    var W = GEO.W, top = GEO.sceneH + 4, h = GEO.gh - 8, left = 40, eW = 62, right = W - eW - 14, run = R.run, b = run.b;
    ctx.fillStyle = '#081a27'; rr(ctx, 6, top, W - 12, h, 10); ctx.fill();
    var gT = top + 22, gB = top + h - 22, gH = gB - gT;
    var span = 12, tNow = b.t, t0 = Math.max(0, tNow - span * 0.85), t1 = t0 + span;
    var vMax = Math.max(1, Math.ceil(Math.sqrt(2 * P.G * b.h0 / P.BETA) + 0.2));
    function gxp(t) { return left + (t - t0) / span * (right - left); }
    function gyp(v) { return gB - v / vMax * gH; }
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath();
    var v, t;
    for (v = 0; v <= vMax; v++) { ctx.moveTo(left, Math.round(gyp(v)) + 0.5); ctx.lineTo(right, Math.round(gyp(v)) + 0.5); }
    for (t = Math.ceil(t0 / 2) * 2; t <= t1; t += 2) { ctx.moveTo(Math.round(gxp(t)) + 0.5, gT); ctx.lineTo(Math.round(gxp(t)) + 0.5, gB); }
    ctx.stroke();
    for (v = 0; v <= vMax; v++) txt(ctx, String(v), left - 6, gyp(v) + 4, C.muted, '10px system-ui,sans-serif', 'right');
    for (t = Math.ceil(t0 / 2) * 2; t <= t1; t += 2) txt(ctx, t + ' s', gxp(t), gB + 14, C.muted, '10px system-ui,sans-serif', 'center');
    txt(ctx, 'speed (m/s) against time (s)', left, top + 15, C.ink, '600 11px system-ui,sans-serif');
    ctx.save(); ctx.beginPath(); ctx.rect(left, gT - 4, right - left, gH + 8); ctx.clip();
    ctx.beginPath(); var started = false;
    run.graph.forEach(function (q) { if (q[0] < t0 - 0.1) return; var X = gxp(q[0]), Y = gyp(q[1]); if (started) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); started = true; } });
    if (started) ctx.lineTo(gxp(tNow), gyp(Math.abs(b.v)));
    if (!reduced) { ctx.shadowColor = C.green; ctx.shadowBlur = 8; }
    ctx.strokeStyle = C.green; ctx.lineWidth = 2.2; ctx.stroke(); ctx.restore();
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(gxp(tNow), gyp(Math.abs(b.v)), 3.5, 0, 7); ctx.fill();
    // energy bar (per kilogram of ball): height energy, motion energy, heat
    var Ex = W - eW - 2, Ew = 16, E0 = run.E0, Epot = P.G * run.tr.height(b.s), Ekin = 0.5 * P.BETA * b.v * b.v, Eh = Math.max(0, E0 - Epot - Ekin);
    txt(ctx, 'energy', Ex + 22, top + 15, C.ink, '600 11px system-ui,sans-serif', 'center');
    ctx.fillStyle = 'rgba(120,170,200,.12)'; ctx.fillRect(Ex, gT, Ew, gH);
    var yb = gB;
    [[Epot, C.blue], [Ekin, C.green], [Eh, C.red]].forEach(function (q) { var hh = gH * Math.max(0, q[0]) / E0; ctx.fillStyle = q[1]; ctx.fillRect(Ex, yb - hh, Ew, hh); yb -= hh; });
    txt(ctx, 'height', Ex + Ew + 4, gT + 9, C.blue, '10px system-ui,sans-serif'); txt(ctx, 'motion', Ex + Ew + 4, gT + 22, C.green, '10px system-ui,sans-serif'); txt(ctx, 'heat', Ex + Ew + 4, gT + 35, C.red, '10px system-ui,sans-serif');
  }
  var readClock = 0;
  function readouts(dt) {
    readClock -= dt; if (readClock > 0) return; readClock = 0.15;
    var run = R.run, b = run.b, tr = run.tr, p = tr.pos(b.s), heat = Math.max(0, 100 * (1 - (0.5 * P.BETA * b.v * b.v + P.G * p.y) / run.E0));
    el.hud.innerHTML = 't = <b>' + fmt(b.t, 1) + ' s</b> · speed <b>' + fmt(Math.abs(b.v), 2) + ' m/s</b><br>height <b>' + fmt(p.y, 3) + ' m</b> · turnarounds <b>' + run.turns + '</b>' + (R.aR === 0 ? '<br>distance <b>' + fmt(Math.max(0, p.x), 2) + ' m</b>' : '') + (!b.moving ? ' · <b>stopped</b>' : '');
    el.read.innerHTML = '<dt>Speed</dt><dd>' + fmt(Math.abs(b.v), 2) + ' m/s</dd><dt>Height now</dt><dd>' + fmt(p.y, 3) + ' m</dd><dt>Started at</dt><dd>' + fmt(b.h0, 3) + ' m</dd>' +
      (R.aR > 0 ? '<dt>Turned around on the right at</dt><dd>' + (isFinite(run.lastTurnH) ? fmt(run.lastTurnH, 3) + ' m' : '—') + '</dd><dt>Rolled up the right ramp</dt><dd>' + (isFinite(run.lastTurnD) ? fmt(run.lastTurnD, 2) + ' m' : '—') + '</dd>' : '<dt>Distance past the bottom</dt><dd>' + fmt(Math.max(0, p.x), 2) + ' m</dd>') +
      '<dt>Motion turned to heat</dt><dd>' + fmt(heat, 1) + '%</dd>';
  }
  newRun(); outputs(); setSpeed(2);
  LAB.loop(function (dt) { if (!R.paused) stepRun(dt); drawRamps(dt); readouts(dt); }, view);

  // =====================================================================================
  // 2. The probe in deep space
  // =====================================================================================
  var pview = $('nl1-pview'), pcv = $('nl1-pcv'), PK = LAB.canvas(pcv), pc = PK.c;
  var DOCK = { x: 34, y: -9 }, SBODY = { x: 38.4, y: -9, hw: 3.4, hh: 1.6 };
  var Q = { m: 1000, fr: false, probe: null, keys: {}, burn: { x: 0, y: 0 }, trail: [], trailClock: 0, cam: { x: 0, y: 0 }, coast: 0, maxSpeed: 0, docked: false, bump: 0, flames: [], impulse: 0, stars: [], firing: false, ux: 0, uy: 0 };
  for (var si = 0; si < 170; si++) Q.stars.push({ x: Math.random(), y: Math.random(), z: 0.15 + Math.random() * 0.85, b: Math.random() });
  var pel = { mass: $('nl1-pmass'), fr: $('nl1-pfr'), read: $('nl1-pread'), hud: $('nl1-phud'), reset: $('nl1-preset'), pad: $('nl1-pad') };
  var PMISS = [
    { id: 'coast', title: 'Coast', goal: 'Get moving faster than 0.5 m/s, then coast for 10 s without firing. Look at the dots.' },
    { id: 'stop', title: 'Dead stop', goal: 'Get going faster than 1 m/s, then stop the probe completely (under 0.02 m/s) with the thrusters.' },
    { id: 'dock', title: 'Dock gently', goal: 'Fly to the space station’s port and arrive slower than 0.3 m/s.' },
    { id: 'friction', title: 'Space with friction', goal: 'Turn friction on, give the probe a push, and watch what it does when you let go.' }
  ];
  var PT = {}; PMISS.forEach(function (m) { PT[m.id] = m.title; });
  var PMS = LAB.missions($('nl1-pmissions'), 'nl-first-law-probe', PMISS, function (id) {
    toastQ = []; toastAt = -10; Q.fr = id === 'friction'; pel.fr.checked = Q.fr; newProbe(); ensureVisible(pview);
    sayIn(pview, id === 'friction' ? 'Friction is on. Fire a thruster for a second, then let go.' : id === 'dock' ? 'The port is the green ring to the right. Slow down before you get there!' : 'Tap or hold the arrow buttons, or use the arrow keys.');
  });
  function pwin(id, text) { if (PMS.done(id)) sayIn(pview, '✓ ' + PT[id] + '! ' + text); }
  function newProbe() { Q.probe = new P.Probe({ m: Q.m, F: 500, mu: Q.fr ? 0.03 : 0 }); Q.trail = []; Q.trailClock = 0; Q.coast = 0; Q.maxSpeed = 0; Q.docked = false; Q.bump = 0; Q.impulse = 0; Q.burn = { x: 0, y: 0 }; Q.flames = []; Q.wasFast = false; }
  pel.mass.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; Q.m = +b.dataset.m; pressSeg(pel.mass, 'm', Q.m); Q.probe.m = Q.m; });
  pel.fr.addEventListener('change', function () { Q.fr = pel.fr.checked; Q.probe.mu = Q.fr ? 0.03 : 0; Q.maxSpeed = 0; });
  pel.reset.addEventListener('click', newProbe);
  // thrusters: a tap fires for half a second; holding keeps firing
  var DIRS = { left: [-1, 0], right: [1, 0], up: [0, 1], down: [0, -1] };
  function fire(dir, on) { var d = DIRS[dir]; if (!d) return; Q.keys[dir] = on; if (on) { if (d[0]) Q.burn.x = d[0] * 0.5; if (d[1]) Q.burn.y = d[1] * 0.5; } }
  pel.pad.querySelectorAll('button').forEach(function (b) {
    function up() { fire(b.dataset.dir, false); b.classList.remove('on'); }
    b.addEventListener('pointerdown', function (e) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) { } fire(b.dataset.dir, true); b.classList.add('on'); });
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
    b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(b.dataset.dir, true); setTimeout(function () { fire(b.dataset.dir, false); }, 50); } });
  });
  var KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
  pcv.addEventListener('keydown', function (e) { var d = KEYMAP[e.key]; if (d) { e.preventDefault(); if (!Q.keys[d]) fire(d, true); } else if (e.key === 'r' || e.key === 'R') newProbe(); });
  pcv.addEventListener('keyup', function (e) { var d = KEYMAP[e.key]; if (d) { e.preventDefault(); fire(d, false); } });
  pcv.addEventListener('blur', function () { Object.keys(DIRS).forEach(function (d) { Q.keys[d] = false; }); });

  function stepProbe(dt) {
    var pr = Q.probe, h = 1 / 240, n = Math.round(dt / h), firing = false;
    for (var i = 0; i < n; i++) {
      var ux = (Q.keys.right ? 1 : 0) - (Q.keys.left ? 1 : 0), uy = (Q.keys.up ? 1 : 0) - (Q.keys.down ? 1 : 0);
      if (!ux && Q.burn.x) ux = Math.sign(Q.burn.x);
      if (!uy && Q.burn.y) uy = Math.sign(Q.burn.y);
      if (Q.burn.x) { Q.burn.x -= Math.sign(Q.burn.x) * h; if (Math.abs(Q.burn.x) < h) Q.burn.x = 0; }
      if (Q.burn.y) { Q.burn.y -= Math.sign(Q.burn.y) * h; if (Math.abs(Q.burn.y) < h) Q.burn.y = 0; }
      if (Q.docked) { if (ux || uy) { Q.docked = false; } else continue; }
      pr.step(h, ux, uy);
      Q.impulse += pr.F * (Math.abs(ux) + Math.abs(uy)) * h;
      if (ux || uy) { firing = true; Q.ux = ux; Q.uy = uy; }
      var sp = pr.speed();
      if (sp > Q.maxSpeed) Q.maxSpeed = sp;
      if (sp > 1 && !Q.fr) Q.wasFast = true;
      if (!ux && !uy && sp > 0.5 && !Q.fr) Q.coast += h; else Q.coast = 0;
      var dx = pr.x - DOCK.x, dy = pr.y - DOCK.y, dd = Math.hypot(dx, dy);
      if (dd < 1.4 && !Q.docked && !ux && !uy) {
        if (sp < 0.3) { Q.docked = true; var spd = sp; pr.vx = pr.vy = 0; pr.x = DOCK.x; pr.y = DOCK.y; Q.coast = 0; if (!PMS.isDone('dock')) pwin('dock', 'Docked at ' + fmt(spd, 2) + ' m/s. Smooth.'); else sayIn(pview, 'Docked at ' + fmt(spd, 2) + ' m/s.'); }
        else if (Q.bump <= 0) { Q.bump = 1.5; pr.vx = -0.5 * pr.vx; pr.vy = -0.5 * pr.vy; sayIn(pview, 'Bump! ' + fmt(sp, 2) + ' m/s is too fast. Docking needs under 0.3 m/s.'); }
      }
      // the station's hull is solid
      if (Math.abs(pr.x - SBODY.x) < SBODY.hw + 0.9 && Math.abs(pr.y - SBODY.y) < SBODY.hh + 0.9) {
        if (Math.abs(pr.x - SBODY.x) / (SBODY.hw + 0.9) > Math.abs(pr.y - SBODY.y) / (SBODY.hh + 0.9)) { pr.vx = -0.5 * pr.vx; pr.x = SBODY.x + Math.sign(pr.x - SBODY.x) * (SBODY.hw + 0.91); }
        else { pr.vy = -0.5 * pr.vy; pr.y = SBODY.y + Math.sign(pr.y - SBODY.y) * (SBODY.hh + 0.91); }
      }
    }
    Q.firing = firing; Q.bump -= dt;
    var sp2 = pr.speed();
    if (Q.coast >= 10) { Q.coast = 0; pwin('coast', '10 s at ' + fmt(sp2, 2) + ' m/s, without a single push. Same speed, same direction.'); }
    if (Q.wasFast && sp2 < 0.02 && !Q.fr && !Q.docked && !firing) { Q.wasFast = false; pwin('stop', 'Stopped. It took a push the other way, as big as the pushes that got it going.'); }
    if (Q.fr && Q.maxSpeed > 0.1 && sp2 === 0 && !firing) { Q.maxSpeed = 0; pwin('friction', 'It stopped by itself. Friction is a force, and it was pushing back the whole time.'); }
    Q.trailClock += dt; if (Q.trailClock >= 1) { Q.trailClock -= 1; if (sp2 > 0.005) { Q.trail.push([pr.x, pr.y]); if (Q.trail.length > 40) Q.trail.shift(); } }
  }
  function drawProbe(dt) {
    PK.fit(); var W = PK.w, H = PK.h, pr = Q.probe, S = clamp(Math.min(W, H) / 22, 13, 30);
    var tx = pr.x + clamp(pr.vx * 3, -6, 6), ty = pr.y + clamp(pr.vy * 3, -4, 4);
    Q.cam.x = reduced ? tx : lerp(Q.cam.x, tx, clamp(dt * 2, 0, 1)); Q.cam.y = reduced ? ty : lerp(Q.cam.y, ty, clamp(dt * 2, 0, 1));
    function X(x) { return W / 2 + (x - Q.cam.x) * S; } function Y(y) { return H / 2 - (y - Q.cam.y) * S; }
    pc.fillStyle = C.bg; pc.fillRect(0, 0, W, H);
    var neb = pc.createRadialGradient(W * 0.75, H * 0.3, 10, W * 0.75, H * 0.3, W * 0.6); neb.addColorStop(0, 'rgba(116,192,252,.10)'); neb.addColorStop(1, 'rgba(6,17,26,0)'); pc.fillStyle = neb; pc.fillRect(0, 0, W, H);
    Q.stars.forEach(function (st) {
      var x = (((st.x * W - Q.cam.x * S * st.z * 0.12) % W) + W) % W, y = (((st.y * H + Q.cam.y * S * st.z * 0.12) % H) + H) % H;
      pc.fillStyle = 'rgba(219,231,239,' + (0.2 + 0.6 * st.b * st.z) + ')'; pc.fillRect(x, y, st.z > 0.8 ? 2 : 1, st.z > 0.8 ? 2 : 1);
    });
    // a navigation grid every 5 m
    pc.strokeStyle = 'rgba(116,192,252,.10)'; pc.lineWidth = 1; pc.beginPath();
    for (var gx = Math.floor((Q.cam.x - W / 2 / S) / 5) * 5; gx <= Q.cam.x + W / 2 / S; gx += 5) { pc.moveTo(Math.round(X(gx)) + 0.5, 0); pc.lineTo(Math.round(X(gx)) + 0.5, H); }
    for (var gy = Math.floor((Q.cam.y - H / 2 / S) / 5) * 5; gy <= Q.cam.y + H / 2 / S; gy += 5) { pc.moveTo(0, Math.round(Y(gy)) + 0.5); pc.lineTo(W, Math.round(Y(gy)) + 0.5); }
    pc.stroke();
    // the station
    var bx = X(SBODY.x), by = Y(SBODY.y);
    pc.save(); pc.translate(bx, by);
    pc.fillStyle = '#24577a'; pc.strokeStyle = 'rgba(143,179,198,.5)'; pc.lineWidth = 1;
    [-1, 1].forEach(function (k) { var y0 = k < 0 ? -6.2 * S : 1.8 * S; pc.fillRect(-2.6 * S, y0, 5.2 * S, 4.4 * S); for (var c = -2.6; c <= 2.61; c += 0.65) { pc.beginPath(); pc.moveTo(c * S, y0); pc.lineTo(c * S, y0 + 4.4 * S); pc.stroke(); } });
    pc.fillStyle = '#1c3448'; pc.strokeStyle = '#8fb3c6'; pc.lineWidth = 1.5; rr(pc, -SBODY.hw * S, -SBODY.hh * S, 2 * SBODY.hw * S, 2 * SBODY.hh * S, 0.6 * S); pc.fill(); pc.stroke();
    pc.fillStyle = '#ffd479'; for (var w = -2; w <= 2; w++) { pc.beginPath(); pc.arc(w * 1.2 * S, 0, 0.18 * S, 0, 7); pc.fill(); }
    pc.restore();
    var near = Math.hypot(pr.x - DOCK.x, pr.y - DOCK.y) < 7, slow = pr.speed() < 0.3, ringCol = Q.docked ? C.green : near ? (slow ? C.green : C.red) : hexA(C.green, 0.75);
    pc.save(); if (!reduced) { pc.shadowColor = ringCol; pc.shadowBlur = 16; }
    pc.strokeStyle = ringCol; pc.lineWidth = 3; pc.beginPath(); pc.arc(X(DOCK.x), Y(DOCK.y), 1.1 * S, 0, 7); pc.stroke(); pc.restore();
    pc.strokeStyle = '#8fb3c6'; pc.lineWidth = 2; pc.beginPath(); pc.moveTo(X(DOCK.x) + 1.1 * S, Y(DOCK.y)); pc.lineTo(bx - SBODY.hw * S, by); pc.stroke();
    txt(pc, Q.docked ? 'docked ✓' : 'port: arrive under 0.3 m/s', X(DOCK.x), Y(DOCK.y) + 1.1 * S + 16, Q.docked ? C.green : C.muted, '600 11px system-ui,sans-serif', 'center');
    // one dot every second
    Q.trail.forEach(function (q, i) { var a = (i + 1) / Q.trail.length; pc.fillStyle = hexA(C.gold, 0.15 + 0.65 * a); pc.beginPath(); pc.arc(X(q[0]), Y(q[1]), 2.6, 0, 7); pc.fill(); });
    // exhaust
    var px = X(pr.x), py = Y(pr.y);
    if (Q.firing && !reduced) for (var f = 0; f < 3; f++) Q.flames.push({ x: pr.x - Q.ux * 1.0, y: pr.y - Q.uy * 1.0, vx: -Q.ux * (3 + Math.random() * 3) + (Math.random() - 0.5), vy: -Q.uy * (3 + Math.random() * 3) + (Math.random() - 0.5), life: 0.35 });
    Q.flames = Q.flames.filter(function (q) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; return q.life > 0; });
    Q.flames.forEach(function (q) { pc.fillStyle = 'rgba(255,' + Math.round(150 + 250 * q.life) + ',121,' + Math.min(1, q.life * 2.4) + ')'; pc.beginPath(); pc.arc(X(q.x), Y(q.y), 1.5 + 6 * q.life, 0, 7); pc.fill(); });
    if (Q.firing && reduced) { pc.fillStyle = C.gold; pc.beginPath(); pc.arc(px - Q.ux * 1.2 * S, py + Q.uy * 1.2 * S, 5, 0, 7); pc.fill(); }
    // the probe: gold-foil body with two solar panels
    pc.save(); pc.translate(px, py);
    pc.fillStyle = '#24577a'; pc.strokeStyle = 'rgba(143,179,198,.7)'; pc.lineWidth = 1;
    pc.fillRect(-2.5 * S, -0.3 * S, 1.6 * S, 0.6 * S); pc.strokeRect(-2.5 * S, -0.3 * S, 1.6 * S, 0.6 * S); pc.fillRect(0.9 * S, -0.3 * S, 1.6 * S, 0.6 * S); pc.strokeRect(0.9 * S, -0.3 * S, 1.6 * S, 0.6 * S);
    var gb = pc.createLinearGradient(-0.9 * S, -0.9 * S, 0.9 * S, 0.9 * S); gb.addColorStop(0, '#ffe8a3'); gb.addColorStop(1, '#b8862b');
    pc.fillStyle = gb; rr(pc, -0.9 * S, -0.9 * S, 1.8 * S, 1.8 * S, 0.3 * S); pc.fill();
    pc.fillStyle = '#e9f1f6'; pc.beginPath(); pc.arc(0, -0.15 * S, 0.38 * S, 0, 7); pc.fill();
    pc.restore();
    var sp = pr.speed();
    if (sp > 0.01) arrow(pc, px, py, px + pr.vx * S * 2.4, py - pr.vy * S * 2.4, C.white, 2.5, 9);
    // which way the station is, when it is off screen
    var ox = X(DOCK.x), oy = Y(DOCK.y);
    if (ox < -20 || ox > W + 20 || oy < -20 || oy > H + 20) {
      var ang = Math.atan2(oy - H / 2, ox - W / 2), ex = W / 2 + Math.cos(ang) * (W / 2 - 26), ey = H / 2 + Math.sin(ang) * (H / 2 - 26);
      ex = clamp(ex, 24, W - 24); ey = clamp(ey, 24, H - 24);
      arrow(pc, ex - Math.cos(ang) * 22, ey - Math.sin(ang) * 22, ex, ey, hexA(C.green, 0.85), 3, 10);
      txt(pc, 'station ' + fmt(Math.hypot(pr.x - DOCK.x, pr.y - DOCK.y), 0) + ' m', ex - Math.cos(ang) * 40, ey - Math.sin(ang) * 40 + 4, C.green, '600 11px system-ui,sans-serif', 'center');
    }
    pel.hud.innerHTML = 'speed <b>' + fmt(sp, 2) + ' m/s</b> · mass <b>' + (pr.m / 1000) + ' t</b><br>coasting for <b>' + fmt(Q.coast, 1) + ' s</b>' + (Q.fr ? ' · <b>friction on</b>' : '');
  }
  var pReadClock = 0;
  function probeReadouts(dt) {
    pReadClock -= dt; if (pReadClock > 0) return; pReadClock = 0.2;
    var pr = Q.probe;
    pel.read.innerHTML = '<dt>Speed</dt><dd>' + fmt(pr.speed(), 3) + ' m/s</dd><dt>Velocity (right, up)</dt><dd>' + fmt(pr.vx, 2) + ', ' + fmt(pr.vy, 2) + ' m/s</dd><dt>One tap changes the speed by</dt><dd>' + fmt(pr.F * 0.5 / pr.m, 4) + ' m/s</dd><dt>All the pushes so far</dt><dd>' + fmt(Q.impulse, 0) + ' N·s</dd>';
  }
  newProbe();
  LAB.loop(function (dt) { stepProbe(dt); drawProbe(dt); probeReadouts(dt); }, pview);

  // =====================================================================================
  // 3. Four small inertia demos
  // =====================================================================================
  var demos = [];
  function demo(id, draw) {
    var c = $(id); if (!c) return { t: 0 };
    var k = LAB.canvas(c), d = { k: k, c: k.c, t: 0, run: false, draw: draw, lw: 0, lh: 0 };
    demos.push(d); return d;
  }
  function bg(c, W, H) { var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1d2d'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  // -- the tablecloth trick --
  var tc = demo('nl1-d-cloth', drawCloth), tcRes = null, tcMode = '';
  function startCloth(mode) {
    tcMode = mode; tcRes = P.tablecloth({ u: mode === 'fast' ? 3 : 0.3, L: 0.3, mu: 0.3, muT: 0.3, pull: 0.62 }); tc.t = 0; tc.run = true;
    $('nl1-d-cloth-cap').textContent = mode === 'fast' ? 'A quick yank at 3 m/s: the cloth is gone in about a tenth of a second. Friction pulls on the dishes for so short a time that they move only ' + fmt(tcRes.slid * 100, 0) + ' cm.' : 'A slow pull at 0.3 m/s: friction has plenty of time. The dishes speed up to match the cloth and ride along with it, toward the edge.';
  }
  function drawCloth(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, base = H * 0.6, x0 = W * 0.1, S = (W * 0.8) / 1.25, path = tcRes ? tcRes.path : [[0, 0, 0]];
    if (d.run) { d.t += dt * (tcMode === 'fast' ? 0.12 : 1); if (d.t > path[path.length - 1][0] + 0.5) d.run = false; }
    var q = path[path.length - 1]; for (var i = 0; i < path.length; i++) if (path[i][0] >= d.t) { q = path[i]; break; }
    var xd = q[1], xc = q[2];
    bg(c, W, H);
    var tx1 = x0 + 1.15 * S;  // the table is 1.15 m long
    c.fillStyle = '#6b4a2b'; c.fillRect(x0, base, tx1 - x0, 9); c.fillStyle = '#4d341e'; c.fillRect(x0 + 12, base + 9, 8, H - base - 9); c.fillRect(tx1 - 20, base + 9, 8, H - base - 9);
    // the cloth starts 0.1 m from the table's left end and hangs over its right end
    var cl0 = x0 + (0.1 + xc) * S, cl1 = tx1;
    if (cl0 < cl1) { c.fillStyle = '#d6336c'; c.fillRect(cl0, base - 3, cl1 - cl0, 4); c.fillStyle = 'rgba(255,255,255,.35)'; for (var s = cl0 + 3; s < cl1; s += 12) c.fillRect(s, base - 3, 5, 2); }
    var hang = Math.min(H - base - 6, 20 + xc * S * 0.4); c.fillStyle = '#d6336c'; c.fillRect(tx1, base - 3, 4, hang);
    // the dishes start 0.3 m from the cloth's back edge
    var dx = x0 + (0.4 + xd) * S;
    c.fillStyle = '#e9f1f6'; c.beginPath(); c.ellipse(dx, base - 6, 0.12 * S, 4.5, 0, 0, 7); c.fill();
    c.fillStyle = '#74c0fc'; rr(c, dx + 0.15 * S, base - 26, 18, 22, 3); c.fill(); c.strokeStyle = '#74c0fc'; c.lineWidth = 3; c.beginPath(); c.arc(dx + 0.15 * S + 20, base - 16, 6, -1.4, 1.4); c.stroke();
    txt(c, '✋', tx1 + 16, base + hang + 4, C.ink, '18px system-ui', 'center');
    txt(c, tcRes ? 'the dishes moved ' + fmt(xd * 100, 1) + ' cm' + (tcMode === 'fast' && d.run ? ' (slow motion)' : '') : 'pull the cloth: quickly or slowly?', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  $('nl1-d-cloth-fast').addEventListener('click', function () { startCloth('fast'); });
  $('nl1-d-cloth-slow').addEventListener('click', function () { startCloth('slow'); });

  // -- a coin on a card over a cup --
  var cc = demo('nl1-d-coin', drawCoin), ccMode = '';
  function startCoin(mode) { ccMode = mode; cc.t = 0; cc.run = true; $('nl1-d-coin-cap').textContent = mode === 'flick' ? 'A flick sends the card away at about 2 m/s, in under 3 hundredths of a second. Friction barely has time to move the coin, so it drops into the cup.' : 'Push the card slowly and friction carries the coin along with it, right past the cup.'; }
  function drawCoin(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, cx = W * 0.45, rim = H * 0.48, S = Math.min(1000, W * 2.4), mu = 0.3, g = P.G;
    if (d.run) d.t += dt; if (d.t > 5) d.run = false;
    var cardX = 0, coinX = 0, coinY = 0, tOff = 0.055 / 2.0;
    if (ccMode === 'flick') { var tr = d.t * 0.08, tin = Math.min(tr, tOff), tf = Math.max(0, tr - tOff); cardX = Math.min(2.0 * tr, 0.5); coinX = 0.5 * mu * g * tin * tin + mu * g * tin * tf; coinY = Math.min(0.5 * g * tf * tf, 0.075); }
    else if (ccMode === 'slow') { cardX = Math.min(0.05 * d.t, 0.13); coinX = cardX; }
    bg(c, W, H);
    var cw = 0.07 * S, ch = 0.08 * S;
    c.fillStyle = '#3a2a1c'; c.fillRect(0, rim + ch, W, 8);
    c.fillStyle = 'rgba(116,192,252,.08)'; c.beginPath(); c.moveTo(cx - cw / 2, rim); c.lineTo(cx - cw / 2 + 6, rim + ch); c.lineTo(cx + cw / 2 - 6, rim + ch); c.lineTo(cx + cw / 2, rim); c.fill();
    c.strokeStyle = 'rgba(165,216,255,.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - cw / 2, rim); c.lineTo(cx - cw / 2 + 6, rim + ch); c.lineTo(cx + cw / 2 - 6, rim + ch); c.lineTo(cx + cw / 2, rim); c.stroke();
    var cardL = cx - 0.055 * S + cardX * S;
    c.fillStyle = '#f9a8d4'; c.fillRect(cardL, rim - 4, 0.11 * S, 4);
    var coinPx = cx + coinX * S, coinPy = rim - 7 + coinY * S;
    c.fillStyle = '#ffd479'; c.beginPath(); c.ellipse(coinPx, coinPy, 0.012 * S, 3, 0, 0, 7); c.fill(); c.strokeStyle = '#b8862b'; c.lineWidth = 1; c.stroke();
    if (ccMode === 'flick' && d.t < 0.5) txt(c, '👉', cx - 0.055 * S - 14, rim + 4, C.ink, '18px system-ui', 'center');
    if (ccMode === 'slow') txt(c, '👉', cardL - 14, rim + 4, C.ink, '18px system-ui', 'center');
    txt(c, ccMode === 'flick' ? (coinY >= 0.075 ? 'plink! into the cup' : 'slow motion') : ccMode === 'slow' ? 'carried along with the card' : 'flick the card, or push it slowly?', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  $('nl1-d-coin-flick').addEventListener('click', function () { startCoin('flick'); });
  $('nl1-d-coin-slow').addEventListener('click', function () { startCoin('slow'); });

  // -- a car braking hard, with and without a seat belt --
  var bk = demo('nl1-d-car', drawCar), beltBox = $('nl1-d-belt'), V0 = 50 / 3.6, ACAR = 0.7 * P.G, GAP = 0.45, bkRes = P.braking(V0, ACAR, GAP);
  bk.belt = true;
  function startCar() { bk.t = 0; bk.run = true; bk.belt = beltBox.checked; $('nl1-d-car-cap').textContent = bk.belt ? 'Belted: the belt pulls the bear along with the car, so it slows down with the car over the whole ' + fmt(bkRes.dStop, 0) + ' m.' : 'No belt: the car slows down, but nothing holds the bear. It carries on at 50 km/h until it meets the dashboard ' + fmt(bkRes.tHit, 2) + ' s later, going ' + fmt(bkRes.vRel * 3.6, 0) + ' km/h faster than the car.'; }
  function drawCar(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, ts = bkRes.tStop;
    if (d.run) { d.t += dt * 0.5; if (d.t > ts + 0.8) d.run = false; }
    var t = Math.min(d.t, ts), xCar = V0 * t - 0.5 * ACAR * t * t, vCar = d.t > 0 ? Math.max(0, V0 - ACAR * d.t) : V0, rel = 0;
    if (d.t > 0 && !d.belt) rel = Math.min(GAP, 0.5 * ACAR * Math.min(d.t, ts) * Math.min(d.t, ts));
    if (d.t > 0 && d.belt) rel = 0.04 * Math.min(1, d.t / 0.3);
    bg(c, W, H);
    var road = H * 0.8, cw = Math.min(160, W * 0.42), cx = cw / 2 + 12 + xCar * ((W - cw - 24) / bkRes.dStop);
    c.fillStyle = '#16354d'; c.fillRect(0, road, W, H - road);
    c.strokeStyle = 'rgba(255,212,121,.5)'; c.setLineDash([16, 14]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, road + 10); c.lineTo(W, road + 10); c.stroke(); c.setLineDash([]);
    var ch = 40, top = road - ch - 14;
    c.fillStyle = '#2f6f9f'; rr(c, cx - cw / 2, top + 10, cw, ch, 10); c.fill();
    c.fillStyle = '#245a82'; rr(c, cx - cw / 2 + cw * 0.18, top - 18, cw * 0.58, 32, 9); c.fill();
    c.fillStyle = 'rgba(165,216,255,.3)'; rr(c, cx - cw / 2 + cw * 0.22, top - 13, cw * 0.5, 24, 6); c.fill();
    [cx - cw * 0.3, cx + cw * 0.3].forEach(function (x2) { c.fillStyle = '#0d1a24'; c.beginPath(); c.arc(x2, road - 9, 12, 0, 7); c.fill(); c.strokeStyle = '#8fb3c6'; c.lineWidth = 2; c.stroke(); });
    var dash = cx + cw * 0.2; c.fillStyle = '#0f2a3d'; c.fillRect(dash, top - 4, 7, 30);
    var bx = cx - cw * 0.1 + rel * (cw * 0.24 / GAP);
    c.fillStyle = '#c08552'; c.beginPath(); c.arc(bx, top + 1, 8, 0, 7); c.fill(); c.beginPath(); c.arc(bx - 6, top - 6, 3.5, 0, 7); c.arc(bx + 6, top - 6, 3.5, 0, 7); c.fill();
    c.fillRect(bx - 8, top + 8, 16, 17);
    c.fillStyle = '#06111a'; c.fillRect(bx + 2, top - 1, 2, 2);
    if (d.belt) { c.strokeStyle = C.gold; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 9, top + 5); c.lineTo(bx + 8, top + 24); c.stroke(); }
    if (d.run && vCar > 0) { c.fillStyle = 'rgba(255,135,135,.9)'; c.fillRect(cx - cw / 2 - 3, top + 18, 5, 9); }
    txt(c, 'car: ' + fmt(vCar * 3.6, 0) + ' km/h' + (d.run ? ' (half speed)' : ''), 10, 18, C.gold, '600 12px system-ui,sans-serif');
    if (!d.belt && d.t > bkRes.tHit) txt(c, 'the bear hit the dash at ' + fmt(bkRes.vRel * 3.6, 0) + ' km/h', 10, 34, C.red, '600 12px system-ui,sans-serif');
  }
  $('nl1-d-car-go').addEventListener('click', startCar);

  // -- a ball dropped on a smooth train --
  var tn = demo('nl1-d-train', drawTrain), tnFrame = 'train', TU = 30, TH = 1.5, tnRes = P.trainDrop(TH, TU), tnPath = [];
  function startTrain() { tn.t = 0; tn.run = true; tnPath = []; }
  function drawTrain(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h;
    if (d.run) { d.t += dt * 0.3; if (d.t > tnRes.t + 0.25) d.run = false; }
    var tt = Math.min(d.t, tnRes.t), y = TH - 0.5 * P.G * tt * tt, xTrain = TU * d.t;
    bg(c, W, H);
    var floor = H * 0.8, S = (floor - 34) / 2.4, cw = Math.min(W * 0.4, 200), x0 = cw / 2 + 8, sc = (W - cw - 16) / tnRes.dx;
    var carX = tnFrame === 'train' ? W * 0.5 : x0 + xTrain * sc, camX = tnFrame === 'train' ? xTrain - (W * 0.5 - x0) / sc : 0;
    c.fillStyle = '#16354d'; c.fillRect(0, floor + 8, W, H - floor - 8);
    for (var p = -40; p < 120; p += 4) { var X = x0 + (p - camX) * sc; if (X < -10 || X > W + 10) continue; c.fillStyle = '#2c4a60'; c.fillRect(X, floor - 70, 4, 78); }
    c.fillStyle = 'rgba(47,111,159,.35)'; c.strokeStyle = '#74c0fc'; c.lineWidth = 2; rr(c, carX - cw / 2, floor - 2.4 * S, cw, 2.4 * S, 10); c.fill(); c.stroke();
    c.fillStyle = '#0d1a24'; [carX - cw / 3, carX + cw / 3].forEach(function (x2) { c.beginPath(); c.arc(x2, floor + 4, 7, 0, 7); c.fill(); });
    if (d.t > 0 && d.t <= tnRes.t + 0.02) tnPath.push([xTrain, Math.max(0, y)]);
    c.fillStyle = hexA(C.gold, 0.55);
    tnPath.forEach(function (q) { var X2 = tnFrame === 'train' ? carX : x0 + q[0] * sc, Y2 = floor - q[1] * S; c.beginPath(); c.arc(X2, Y2, 2, 0, 7); c.fill(); });
    c.fillStyle = C.gold; c.beginPath(); c.arc(carX, Math.min(floor - 5, floor - y * S), 6, 0, 7); c.fill();
    txt(c, tnFrame === 'train' ? 'riding the train: it falls straight down' : 'from the platform: it falls along a curve', 10, 18, C.gold, '600 12px system-ui,sans-serif');
    if (d.t >= tnRes.t) txt(c, 'fall time ' + fmt(tnRes.t, 2) + ' s; ball and train both moved ' + fmt(tnRes.dx, 1) + ' m', 10, 34, C.ink, '12px system-ui,sans-serif');
  }
  $('nl1-d-train-go').addEventListener('click', startTrain);
  $('nl1-d-frame').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; tnFrame = b.dataset.frame; pressSeg($('nl1-d-frame'), 'frame', tnFrame); startTrain(); });

  var demoWrap = $('nl1-demos');
  if (demoWrap) LAB.loop(function (dt) {
    demos.forEach(function (d) {
      d.k.fit();
      if (!d.run && d.lw === d.k.w && d.lh === d.k.h && !d.dirty) return;
      d.draw(d, dt); d.lw = d.k.w; d.lh = d.k.h; d.dirty = d.run;
    });
  }, demoWrap);
})();
