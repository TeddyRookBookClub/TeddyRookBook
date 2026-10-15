/* Newton's Laws, Chapter 3 (Action and Reaction): the page. Two skaters pushing off each other (main simulation), the
   horse-and-cart puzzle with free-body diagrams, and four small demos (spring scales, a balloon rocket, walking on ice,
   throwing from a skateboard). The physics is in physics.js (window.NL3Phys), in SI units. */
(function () {
  'use strict';
  var LAB = window.TRBLab, P = window.NL3Phys;
  var root = document.getElementById('nl3-lab');
  if (!root || !LAB || !P) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced, G = P.G;
  var C = { bg: '#06111a', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', faint: 'rgba(120,170,200,.12)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', white: '#ffffff', violet: '#b197fc' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function arrow(ctx, x1, y1, x2, y2, col, w, head, dash) {
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy); if (L < 1) return;
    var hd = Math.min(head || 10, L * 0.6), ux = dx / L, uy = dy / L;
    ctx.save(); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 3; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - ux * hd * 0.7, y2 - uy * hd * 0.7); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - ux * hd - uy * hd * 0.5, y2 - uy * hd + ux * hd * 0.5); ctx.lineTo(x2 - ux * hd + uy * hd * 0.5, y2 - uy * hd - ux * hd * 0.5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function txt(ctx, s, x, y, col, font, align) { ctx.fillStyle = col; ctx.font = font || '12px system-ui,sans-serif'; ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(s, x, y); }
  function badge(ctx, x, y, n, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); txt(ctx, String(n), x, y + 4, '#06111a', '700 10px system-ui,sans-serif', 'center'); }
  function pressSeg(group, attr, val) { group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-' + attr) === String(val))); }); }
  var toastQ = [], toastAt = -10;
  function sayIn(v, text) { toastQ.push([v, text]); pump(); }
  function pump() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.8) { toastAt = now; var q = toastQ.shift(); LAB.toast(q[0], q[1]); } }
  setInterval(pump, 400);
  function ensureVisible(v) { var r = v.getBoundingClientRect(), H = window.innerHeight || 800, seen = Math.min(r.bottom, H) - Math.max(r.top, 0); if (seen < 0.7 * Math.min(r.height, H)) v.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
  // a skater (or a person) drawn from the feet up; h: height in px; reach: 0..1 how far the arms push forward; dir: +1 faces right
  function person(c, x, y, h, dir, col, reach, lean, skate) {
    var s = h / 1.7;
    c.save(); c.translate(x, y); c.scale(dir, 1); c.rotate((lean || 0) * dir * 0);
    c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = Math.max(3, 0.11 * s);
    var hip = -0.9 * s, sh = -1.42 * s, lx = (lean || 0) * s;
    c.beginPath(); c.moveTo(-0.12 * s, 0); c.lineTo(lx * 0.3, hip); c.lineTo(0.14 * s, -0.02 * s); c.stroke();          // legs
    c.beginPath(); c.moveTo(lx * 0.3, hip); c.lineTo(lx, sh); c.stroke();                                                 // body
    var ax = lx + (0.2 + 0.32 * reach) * s, ay = sh + (0.12 - 0.06 * reach) * s;
    c.beginPath(); c.moveTo(lx, sh + 0.04 * s); c.lineTo(ax, ay); c.moveTo(lx, sh + 0.04 * s); c.lineTo(ax - 0.02 * s, ay + 0.08 * s); c.stroke();  // arms
    c.beginPath(); c.arc(lx + 0.02 * s, sh - 0.17 * s, 0.13 * s, 0, 7); c.fill();                                        // head
    if (skate) { c.strokeStyle = '#dbe7ef'; c.lineWidth = 2; c.beginPath(); c.moveTo(-0.3 * s, 0.03 * s); c.lineTo(0.05 * s, 0.03 * s); c.moveTo(-0.02 * s, 0.03 * s); c.lineTo(0.33 * s, 0.03 * s); c.stroke(); }
    c.restore();
  }

  // =====================================================================================
  // 1. Two skaters
  // =====================================================================================
  var view = $('nl3-view'), cv = $('nl3-cv'), K = LAB.canvas(cv), ctx = K.c;
  var GAP0 = 0.9, MU = 0.02, RINK = 30;
  var S = { mA: 40, mB: 80, wall: false, F: 200, T: 0.5, fric: false, sk: null, pushed: false, done: false, hist: [], cam: { x: 0, s: 120 }, flash: 0, paused: false, checked: false };
  var el = { mA: $('nl3-mA'), mAO: $('nl3-mA-o'), mB: $('nl3-mB'), mBO: $('nl3-mB-o'), wall: $('nl3-wall'), F: $('nl3-F'), FO: $('nl3-F-o'), T: $('nl3-T'), TO: $('nl3-T-o'), fric: $('nl3-fric'), push: $('nl3-push'), read: $('nl3-read'), hud: $('nl3-hud'), reset: $('nl3-reset'), pause: $('nl3-pause'), pred: $('nl3-pred') };
  var MISSIONS = [
    { id: 'twins', title: 'Twins', goal: 'Give the skaters the same mass and push. Who glides away faster?' },
    { id: 'bigsmall', title: 'Big and small', goal: 'Make one skater at least 40 kg heavier than the other, then push. Compare the two force arrows.' },
    { id: 'three', title: 'Three times as fast', goal: 'With no friction, make the lighter skater leave exactly three times as fast as the heavier one (within 2%).' },
    { id: 'wall', title: 'Push the wall', goal: 'Turn skater B into the rink wall and push off it. Who pushed skater A?' },
    { id: 'gap', title: 'Twenty meters', goal: 'With ice friction on, push so the skaters come to rest 20 m apart (within 0.5 m).' }
  ];
  var TITLE = {}; MISSIONS.forEach(function (m) { TITLE[m.id] = m.title; });
  var PICK = {
    twins: function () { setup(50, 50, false, 200, 0.5, false); sayIn(view, 'Same mass. Press Push!'); },
    bigsmall: function () { setup(30, 90, false, 300, 0.5, false); sayIn(view, '30 kg and 90 kg. Watch the force arrows during the push.'); },
    three: function () { setup(30, 60, false, 300, 0.5, false); sayIn(view, 'Change one mass so the speeds come out 3 to 1.'); },
    wall: function () { setup(50, 80, true, 300, 0.5, false); sayIn(view, 'B is now the wall. Press Push!'); },
    gap: function () { setup(40, 60, false, 200, 0.5, true); sayIn(view, 'Friction slows both at 0.2 m/s². Find the push that leaves them 20 m apart.'); }
  };
  var MS = LAB.missions($('nl3-missions'), 'nl-third-law', MISSIONS, function (id) { toastQ = []; toastAt = -10; if (PICK[id]) PICK[id](); ensureVisible(view); });
  function win(id, text) { if (MS.done(id)) { sayIn(view, '✓ ' + TITLE[id] + '! ' + text); S.flash = 1; } }
  function newSk() {
    S.sk = new P.Skaters({ mA: S.mA, mB: S.wall ? Infinity : S.mB, F: S.F, T: S.T, mu: S.fric ? MU : 0, gap: GAP0 });
    S.sk.t = -1; S.pushed = false; S.done = false; S.hist = []; S.checked = false;
    if (S.wall) S.sk.xA = -GAP0 / 2;
  }
  function setup(mA, mB, wall, F, T, fric) { S.mA = mA; S.mB = mB; S.wall = wall; S.F = F; S.T = T; S.fric = fric; syncForm(); newSk(); }
  function syncForm() {
    el.mA.value = S.mA; el.mB.value = S.mB; el.wall.checked = S.wall; el.F.value = S.F; el.T.value = S.T; el.fric.checked = S.fric; el.mB.disabled = S.wall;
    el.mAO.textContent = S.mA + ' kg'; el.mBO.textContent = S.wall ? 'wall' : S.mB + ' kg'; el.FO.textContent = S.F + ' N'; el.TO.textContent = fmt(S.T, 2) + ' s';
    var pr = P.skaterPrediction(S.mA, S.wall ? Infinity : S.mB, S.F, S.T, 0);
    el.pred.textContent = 'This push gives an impulse of 2 × ' + S.F + ' N × ' + fmt(S.T, 2) + ' s ÷ π = ' + fmt(pr.J, 1) + ' N·s to each skater.';
  }
  function changed() { S.mA = +el.mA.value; S.mB = +el.mB.value; S.wall = el.wall.checked; S.F = +el.F.value; S.T = +el.T.value; S.fric = el.fric.checked; syncForm(); newSk(); }
  [el.mA, el.mB, el.F, el.T].forEach(function (i) { i.addEventListener('input', changed); });
  [el.wall, el.fric].forEach(function (i) { i.addEventListener('change', changed); });
  function push() { newSk(); S.sk.t = 0; S.pushed = true; }
  el.push.addEventListener('click', push);
  $('nl3-push2').addEventListener('click', function (e) { e.stopPropagation(); push(); });
  el.reset.addEventListener('click', newSk);
  el.pause.addEventListener('click', function () { S.paused = !S.paused; el.pause.textContent = S.paused ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', S.paused ? 'Play' : 'Pause'); });
  cv.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); push(); } else if (e.key === 'r' || e.key === 'R') newSk(); });
  cv.addEventListener('click', function () { if (!S.pushed) push(); });

  function stepSk(dt) {
    var s = S.sk; if (!S.pushed) return;
    var slow = s.t < s.T + 0.2 ? 0.5 : 1, h = 1 / 1000, n = Math.round(dt * slow / h);
    for (var i = 0; i < n; i++) {
      s.step(h);
      if (s.xA < -RINK + 0.3) { s.xA = -RINK + 0.3; s.vA = 0; }
      if (!S.wall && s.xB > RINK - 0.3) { s.xB = RINK - 0.3; s.vB = 0; }
    }
    if (s.t <= s.T + 0.5) S.hist.push([s.t, s.force(s.t)]);
    if (s.t > s.T && !S.checked) { S.checked = true; afterPush(); }
    if (S.fric && s.t > s.T && s.vA === 0 && s.vB === 0 && !S.done) { S.done = true; atRest(); }
  }
  function afterPush() {
    var s = S.sk, vA = Math.abs(s.vA), vB = Math.abs(s.vB);
    if (S.fric) return;
    if (S.wall) { win('wall', 'The wall pushed skater A with up to ' + S.F + ' N, just as hard as A pushed it. A left at ' + fmt(vA, 2) + ' m/s.'); return; }
    if (S.mA === S.mB) win('twins', 'Same mass, same push: both left at ' + fmt(vA, 2) + ' m/s, in opposite directions.');
    if (Math.abs(S.mA - S.mB) >= 40) win('bigsmall', 'The two force arrows were the same size the whole time, up to ' + S.F + ' N each. The lighter skater just has less mass to move.');
    var hi = Math.max(vA, vB), lo = Math.min(vA, vB);
    if (lo > 0 && Math.abs(hi / lo - 3) <= 0.06) win('three', fmt(hi, 2) + ' m/s and ' + fmt(lo, 2) + ' m/s: three to one, because the masses are ' + Math.max(S.mA, S.mB) + ' and ' + Math.min(S.mA, S.mB) + ' kg.');
  }
  function atRest() {
    var s = S.sk, gap = s.xB - s.xA;
    if (S.wall) return;
    if (Math.abs(gap - 20) <= 0.5) win('gap', 'They stopped ' + fmt(gap, 2) + ' m apart.');
    else sayIn(view, 'They stopped ' + fmt(gap, 1) + ' m apart. ' + (gap < 20 ? 'Push harder or longer.' : 'Push a little less.'));
  }

  function drawSk(dt) {
    K.fit(); var W = K.w, H = K.h, s = S.sk, sceneH = Math.round(H * 0.6), floor = sceneH - 34;
    // camera: fit both skaters
    var left = s.xA - 1.2, right = (S.wall ? s.xB + 0.6 : s.xB + 1.2), span = Math.max(4.5, right - left), tgtS = Math.min(150, (W - 40) / span, (floor - 30) / 2.2), tgtX = (left + right) / 2;
    S.cam.s = reduced ? tgtS : lerp(S.cam.s, tgtS, clamp(dt * 3, 0, 1)); S.cam.x = reduced ? tgtX : lerp(S.cam.x, tgtX, clamp(dt * 3, 0, 1));
    var sc = S.cam.s; function X(x) { return W / 2 + (x - S.cam.x) * sc; }
    ctx.clearRect(0, 0, W, H);
    // the arena
    var g = ctx.createLinearGradient(0, 0, 0, sceneH); g.addColorStop(0, '#0b1d2d'); g.addColorStop(1, '#10283b'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, sceneH);
    for (var i = 0; i < 9; i++) { var lx = ((i * 197 - S.cam.x * sc * 0.2) % (W + 200) + W + 200) % (W + 200) - 100; var lg = ctx.createRadialGradient(lx, 18, 1, lx, 18, 60); lg.addColorStop(0, 'rgba(255,240,200,.25)'); lg.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = lg; ctx.fillRect(lx - 60, 0, 120, 80); }
    var boardTop = floor - 0.95 * Math.min(sc, 120);
    ctx.fillStyle = '#e9f1f6'; ctx.fillRect(0, boardTop, W, floor - boardTop);
    ctx.fillStyle = '#c92a2a'; ctx.fillRect(0, boardTop + 4, W, 3); ctx.fillStyle = '#1c7ed6'; ctx.fillRect(0, floor - 10, W, 3);
    // ice with distance marks every meter
    var ig = ctx.createLinearGradient(0, floor, 0, sceneH); ig.addColorStop(0, '#d0ebff'); ig.addColorStop(1, '#a5d8ff'); ctx.fillStyle = ig; ctx.fillRect(0, floor, W, sceneH - floor);
    var step = sc > 60 ? 1 : sc > 25 ? 2 : 5;
    for (var m = Math.ceil((S.cam.x - W / 2 / sc) / step) * step; m <= S.cam.x + W / 2 / sc; m += step) { var X0 = X(m); ctx.fillStyle = m === 0 ? '#c92a2a' : 'rgba(28,126,214,.5)'; ctx.fillRect(X0 - (m === 0 ? 1.5 : 0.5), floor, m === 0 ? 3 : 1, sceneH - floor); if (m % (step * 2) === 0 || step === 5) txt(ctx, m + ' m', X0, sceneH - 6, '#1c4b6e', '10px system-ui,sans-serif', 'center'); }
    if (Math.abs(RINK - S.cam.x) * sc < W) { ctx.fillStyle = '#e9f1f6'; ctx.fillRect(X(RINK), boardTop, 12, sceneH - boardTop); ctx.fillRect(X(-RINK) - 12, boardTop, 12, sceneH - boardTop); }
    // skaters
    var pushing = S.pushed && s.t >= 0 && s.t <= s.T, reach = pushing ? 0.3 + 0.7 * s.t / s.T : (S.pushed ? 0.15 : 0.35);
    function hgt(m) { return (1.15 + 0.6 * (m - 20) / 100) * sc; }
    var yF = floor + 6, hA = hgt(S.mA), aX = X(s.xA);
    // reflections
    ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(0, 2 * yF); ctx.scale(1, -1);
    person(ctx, aX, yF, hA, 1, '#f783ac', reach, 0, true); if (!S.wall) person(ctx, X(s.xB), yF, hgt(S.mB), -1, '#74c0fc', reach, 0, true);
    ctx.restore();
    person(ctx, aX, yF, hA, 1, '#f783ac', reach, 0, true);
    txt(ctx, 'A · ' + S.mA + ' kg', aX, yF - hA - 12, '#f9a8d4', '700 12px system-ui,sans-serif', 'center');
    if (S.wall) { ctx.fillStyle = '#e9f1f6'; ctx.fillRect(X(s.xB), boardTop - 30, W, floor - boardTop + 30); ctx.fillStyle = '#c92a2a'; ctx.fillRect(X(s.xB), boardTop - 26, W, 3); txt(ctx, 'the wall', X(s.xB) + 10, boardTop - 36, C.ink, '700 12px system-ui,sans-serif'); }
    else { var hB = hgt(S.mB); person(ctx, X(s.xB), yF, hB, -1, '#74c0fc', reach, 0, true); txt(ctx, 'B · ' + S.mB + ' kg', X(s.xB), yF - hB - 12, '#a5d8ff', '700 12px system-ui,sans-serif', 'center'); }
    // forces during the push: a third-law pair, equal and opposite
    var fs = Math.min(0.32, (W * 0.3) / 600), Fv = s.f, armY = yF - Math.min(hA, S.wall ? hA : hgt(S.mB)) * 0.78 + 12;
    if (pushing && Fv > 1) {
      var mid = S.wall ? X(s.xB) : (aX + X(s.xB)) / 2;
      arrow(ctx, mid - 4, armY - 26, mid - 4 - Fv * fs, armY - 26, C.green, 4, 11);
      arrow(ctx, mid + 4, armY - 26, mid + 4 + Fv * fs, armY - 26, C.green, 4, 11);
      var ly = Math.max(70, yF - Math.max(hA, S.wall ? hA : hgt(S.mB)) - 64);
      ctx.fillStyle = 'rgba(6,17,26,.72)'; rr(ctx, mid - 190, ly - 16, 380, 24, 8); ctx.fill();
      txt(ctx, '← ' + (S.wall ? 'wall' : 'B') + ' pushes A: ' + fmt(Fv, 0) + ' N', mid - 10, ly, C.green, '700 12px system-ui,sans-serif', 'right');
      txt(ctx, 'A pushes ' + (S.wall ? 'wall' : 'B') + ': ' + fmt(Fv, 0) + ' N →', mid + 10, ly, C.green, '700 12px system-ui,sans-serif', 'left');
    }
    // velocities after the push
    if (S.pushed && s.t > 0.05) {
      var vs = Math.min(40, sc * 0.6);
      if (Math.abs(s.vA) > 0.005) { arrow(ctx, aX, yF - hA - 30, aX + s.vA * vs, yF - hA - 30, C.white, 2.5, 9); txt(ctx, fmt(Math.abs(s.vA), 2) + ' m/s', aX + s.vA * vs - 6, yF - hA - 36, C.white, '600 11px system-ui,sans-serif', 'right'); }
      if (!S.wall && Math.abs(s.vB) > 0.005) { var bX = X(s.xB), hB2 = hgt(S.mB); arrow(ctx, bX, yF - hB2 - 30, bX + s.vB * vs, yF - hB2 - 30, C.white, 2.5, 9); txt(ctx, fmt(s.vB, 2) + ' m/s', bX + s.vB * vs + 6, yF - hB2 - 36, C.white, '600 11px system-ui,sans-serif'); }
    }
    if (!S.pushed) txt(ctx, 'press Push! (or tap the ice)', W / 2, 24, hexA(C.ink, 0.85), 'italic 13px Georgia,serif', 'center');
    if (S.flash > 0) { ctx.fillStyle = 'rgba(99,230,190,' + (0.16 * S.flash) + ')'; ctx.fillRect(0, 0, W, sceneH); S.flash = Math.max(0, S.flash - dt * 1.5); }
    drawSkGraphs(sceneH);
  }
  function drawSkGraphs(top) {
    var W = K.w, H = K.h, s = S.sk, narrow = W < 560, gW = narrow ? W - 12 : (W - 18) * 0.6, gH = narrow ? (H - top - 14) * 0.55 : H - top - 8, x0 = 6, y0 = top + 4;
    ctx.fillStyle = '#081a27'; rr(ctx, x0, y0, gW, gH, 10); ctx.fill();
    var left = x0 + 42, right = x0 + gW - 10, yT = y0 + 24, yB = y0 + gH - 18, tMax = Math.max(1.2, S.T + 0.4), fMax = Math.max(100, Math.ceil(S.F / 100) * 100);
    function gx(t) { return left + t / tMax * (right - left); } function gy(f) { return (yT + yB) / 2 - f / fMax * (yB - yT) / 2; }
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(left, Math.round(gy(0)) + 0.5); ctx.lineTo(right, Math.round(gy(0)) + 0.5); ctx.moveTo(left, Math.round(gy(fMax)) + 0.5); ctx.lineTo(right, Math.round(gy(fMax)) + 0.5); ctx.moveTo(left, Math.round(gy(-fMax)) + 0.5); ctx.lineTo(right, Math.round(gy(-fMax)) + 0.5); ctx.stroke();
    txt(ctx, 'force (N) during the push', left, y0 + 15, C.ink, '600 11px system-ui,sans-serif');
    txt(ctx, '+' + fMax, left - 5, gy(fMax) + 4, C.muted, '9.5px system-ui,sans-serif', 'right'); txt(ctx, '0', left - 5, gy(0) + 3, C.muted, '9.5px system-ui,sans-serif', 'right'); txt(ctx, '−' + fMax, left - 5, gy(-fMax) + 4, C.muted, '9.5px system-ui,sans-serif', 'right');
    for (var t = 0; t <= tMax + 1e-9; t += 0.2) txt(ctx, fmt(t, 1), gx(t), yB + 13, C.muted, '9.5px system-ui,sans-serif', 'center');
    // the planned push, faint, then the real one
    function curve(sign, col, upto, alpha) {
      ctx.beginPath(); ctx.moveTo(gx(0), gy(0));
      for (var q = 0; q <= upto + 1e-9; q += S.T / 60) ctx.lineTo(gx(q), gy(sign * S.F * Math.sin(Math.PI * Math.min(q, S.T) / S.T) * (q <= S.T ? 1 : 0)));
      ctx.lineTo(gx(Math.min(upto, S.T)), gy(0)); ctx.closePath(); ctx.fillStyle = hexA(col, alpha * 0.35); ctx.fill(); ctx.strokeStyle = hexA(col, alpha); ctx.lineWidth = 2; ctx.stroke();
    }
    var now = S.pushed ? clamp(s.t, 0, S.T) : 0;
    curve(1, C.blue, S.T, 0.25); curve(-1, C.pink, S.T, 0.25);
    if (S.pushed && now > 0) { curve(1, C.blue, now, 1); curve(-1, C.pink, now, 1); }
    txt(ctx, 'on B (to the right)', right - 4, gy(fMax * 0.8), C.blue, '600 10.5px system-ui,sans-serif', 'right');
    txt(ctx, 'on A (to the left)', right - 4, gy(-fMax * 0.8) + 8, C.pink, '600 10.5px system-ui,sans-serif', 'right');
    // momentum bars
    var bx0 = narrow ? 6 : x0 + gW + 6, by0 = narrow ? y0 + gH + 6 : y0, bW = narrow ? W - 12 : W - bx0 - 6, bH = narrow ? H - by0 - 6 : gH;
    ctx.fillStyle = '#081a27'; rr(ctx, bx0, by0, bW, bH, 10); ctx.fill();
    txt(ctx, 'momentum (kg·m/s)', bx0 + 10, by0 + 15, C.ink, '600 11px system-ui,sans-serif');
    var pA = S.mA * s.vA, pB = S.wall ? 0 : S.mB * s.vB, pT = pA + pB, pMax = Math.max(50, Math.abs(pA), Math.abs(pB)) * 1.1;
    var a0 = bx0 + 44, a1 = bx0 + bW - 66, mx = (a0 + a1) / 2, rows = [['A', pA, C.pink], ['B', pB, C.blue], ['total', pT, C.green]], rh = (bH - 26) / 3;
    rows.forEach(function (r, i) {
      var yy = by0 + 24 + i * rh, bh = Math.min(16, rh * 0.5), w = r[1] / pMax * (a1 - a0) / 2;
      ctx.fillStyle = 'rgba(120,170,200,.10)'; ctx.fillRect(a0, yy + rh / 2 - bh / 2, a1 - a0, bh);
      ctx.fillStyle = r[2]; ctx.fillRect(Math.min(mx, mx + w), yy + rh / 2 - bh / 2, Math.abs(w), bh);
      txt(ctx, r[0], bx0 + 10, yy + rh / 2 + 4, r[2], '600 10.5px system-ui,sans-serif');
      txt(ctx, fmt(r[1], 1), bx0 + bW - 8, yy + rh / 2 + 4, C.ink, '600 10.5px ui-monospace,Menlo,monospace', 'right');
    });
    ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.moveTo(mx + 0.5, by0 + 22); ctx.lineTo(mx + 0.5, by0 + bH - 4); ctx.stroke();
    txt(ctx, '← left · right →', mx, by0 + bH - 6, C.muted, '9.5px system-ui,sans-serif', 'center');
  }
  var readClock = 0;
  function readouts(dt) {
    readClock -= dt; if (readClock > 0) return; readClock = 0.15;
    var s = S.sk, vA = Math.abs(s.vA), vB = Math.abs(s.vB), pA = S.mA * s.vA, pB = S.wall ? 0 : S.mB * s.vB;
    el.hud.innerHTML = (S.pushed ? 't = <b>' + fmt(Math.max(0, s.t), 2) + ' s</b>' + (s.t < s.T + 0.2 ? ' (slow motion)' : '') + '<br>' : '') + 'A <b>' + fmt(vA, 2) + ' m/s</b>' + (S.wall ? '' : ' · B <b>' + fmt(vB, 2) + ' m/s</b>') + '<br>gap <b>' + fmt(s.xB - s.xA, 2) + ' m</b>';
    el.read.innerHTML = '<dt>Push on each, right now</dt><dd>' + fmt(Math.max(0, s.f), 0) + ' N</dd><dt>Impulse given so far</dt><dd>' + fmt(s.J, 1) + ' N·s</dd><dt>Speed of A</dt><dd>' + fmt(vA, 3) + ' m/s</dd>' + (S.wall ? '' : '<dt>Speed of B</dt><dd>' + fmt(vB, 3) + ' m/s</dd><dt>Speed ratio A : B</dt><dd>' + (vB > 1e-6 ? fmt(vA / vB, 3) : '—') + '</dd><dt>Mass ratio B : A</dt><dd>' + fmt(S.mB / S.mA, 3) + '</dd>') + '<dt>Momentum of A + B</dt><dd>' + fmt(pA, 1) + ' + ' + fmt(pB, 1) + ' = ' + fmt(pA + pB, 1) + '</dd><dt>Distance apart</dt><dd>' + fmt(s.xB - s.xA, 2) + ' m</dd>';
  }
  syncForm(); newSk();
  LAB.loop(function (dt) { if (!S.paused) stepSk(dt); drawSk(dt); readouts(dt); }, view);

  // =====================================================================================
  // 2. The horse and the cart
  // =====================================================================================
  var hview = $('nl3-hview'), hcv = $('nl3-hcv'), HK = LAB.canvas(hcv), hc = HK.c;
  var MH = 600, CRR = 0.05;
  var HC = { Fg: 0, mc: 200, v: 0, x: 0, a: 0, T: 0, pairs: true, vert: false, gait: 0 };
  var hel = { Fg: $('nl3-hFg'), FgO: $('nl3-hFg-o'), load: $('nl3-hload'), pairs: $('nl3-hpairs'), vert: $('nl3-hvert'), read: $('nl3-hread'), reset: $('nl3-hreset') };
  function fr() { return CRR * HC.mc * G; }
  hel.Fg.addEventListener('input', function () { HC.Fg = +hel.Fg.value; hel.FgO.textContent = HC.Fg + ' N'; });
  hel.load.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; HC.mc = +b.dataset.mc; pressSeg(hel.load, 'mc', HC.mc); });
  hel.pairs.addEventListener('change', function () { HC.pairs = hel.pairs.checked; });
  hel.vert.addEventListener('change', function () { HC.vert = hel.vert.checked; });
  hel.reset.addEventListener('click', function () { HC.v = 0; HC.Fg = 0; hel.Fg.value = 0; hel.FgO.textContent = '0 N'; });
  function stepHC(dt) {
    var f = fr(), moving = HC.v > 0 || HC.Fg > f;
    if (moving) { HC.a = (HC.Fg - f) / (MH + HC.mc); HC.T = HC.mc * HC.a + f; HC.v += HC.a * dt; if (HC.v <= 0) { HC.v = 0; HC.a = 0; HC.T = Math.min(HC.Fg, f); } }
    else { HC.a = 0; HC.T = HC.Fg; }
    if (HC.v >= 5 && HC.Fg > f) { HC.Fg = Math.round(f); hel.Fg.value = HC.Fg; hel.FgO.textContent = HC.Fg + ' N'; sayIn(hview, 'A fast trot, 5 m/s. The horse now pushes only ' + HC.Fg + ' N, as hard as the road holds the cart back: net force zero, steady speed.'); }
    HC.x += HC.v * dt; HC.gait += HC.v * dt * 2.2;
  }
  function horse(c, x, y, s, gait) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = '#8c5a33'; c.strokeStyle = '#8c5a33'; c.lineCap = 'round';
    c.lineWidth = 7; var legs = [[-34, 0], [-22, Math.PI], [24, Math.PI * 0.5], [36, Math.PI * 1.5]];
    legs.forEach(function (l) { var sw = Math.sin(gait + l[1]) * 0.35; c.beginPath(); c.moveTo(l[0], -42); c.lineTo(l[0] + Math.sin(sw) * 18, -20); c.lineTo(l[0] + Math.sin(sw) * 26, 0); c.stroke(); });
    c.beginPath(); c.ellipse(0, -52, 46, 20, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(30, -62); c.lineTo(54, -96); c.lineTo(66, -92); c.lineTo(46, -52); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(70, -96, 18, 9, 0.5, 0, 7); c.fill();
    c.fillStyle = '#5c3a1e'; c.beginPath(); c.moveTo(-44, -60); c.quadraticCurveTo(-64, -48, -58, -24); c.lineTo(-52, -26); c.quadraticCurveTo(-56, -46, -42, -52); c.fill();
    c.beginPath(); c.moveTo(40, -70); c.lineTo(56, -100); c.lineTo(50, -100); c.lineTo(34, -70); c.fill();
    c.fillStyle = '#06111a'; c.beginPath(); c.arc(74, -99, 2, 0, 7); c.fill();
    c.restore();
  }
  function fbd(c, cx, cy, title, forces, net, scale, w, h) {
    c.fillStyle = 'rgba(11,27,39,.9)'; rr(c, cx - w / 2, cy - h / 2, w, h, 10); c.fill(); c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
    txt(c, title, cx - w / 2 + 10, cy - h / 2 + 16, C.ink, '700 11.5px system-ui,sans-serif');
    var oy = cy + 6;
    forces.forEach(function (f) {
      var L = f.dir[1] ? h * 0.3 : f.F * scale, dx = f.dir[0] * L, dy = f.dir[1] * L;
      if (Math.abs(f.F) < 0.5) return;
      arrow(c, cx, oy, cx + dx, oy - dy, f.col, 3, 9, f.dash);
      var tx = cx + dx + (f.dir[0] ? f.dir[0] * 6 : 6), ty = oy - dy + (f.dir[1] ? -f.dir[1] * 12 : 14 * (f.row || 0) - 6);
      txt(c, f.label + ' ' + fmt(f.F, 0) + ' N', tx, ty, f.col, '600 10.5px system-ui,sans-serif', f.dir[0] < 0 ? 'right' : f.dir[0] > 0 ? 'left' : 'left');
      if (f.pair && HC.pairs) badge(c, cx + dx * 0.5, oy - dy * 0.5 - (f.dir[0] ? 12 : 0) + (f.dir[1] ? 0 : 0), f.pair, f.col);
    });
    c.fillStyle = C.white; c.beginPath(); c.arc(cx, oy, 4, 0, 7); c.fill();
    txt(c, 'net ' + fmt(net, 0) + ' N' + (Math.abs(net) < 0.5 ? ' (balanced)' : ' →'), cx - w / 2 + 10, cy + h / 2 - 9, C.green, '700 11px system-ui,sans-serif');
    if (HC.vert) txt(c, 'up and down arrows shortened; they cancel', cx + w / 2 - 10, cy + h / 2 - 9, C.muted, '10px system-ui,sans-serif', 'right');
  }
  function drawHC(dt) {
    stepHC(dt);
    HK.fit(); var W = HK.w, H = HK.h, narrow = W < 560, sceneH = narrow ? H * 0.46 : H * 0.5, gy = sceneH - 26, f = fr();
    hc.clearRect(0, 0, W, H);
    var sg = hc.createLinearGradient(0, 0, 0, sceneH); sg.addColorStop(0, '#173653'); sg.addColorStop(1, '#0b1d2d'); hc.fillStyle = sg; hc.fillRect(0, 0, W, sceneH);
    hc.fillStyle = '#5b4a33'; hc.fillRect(0, gy, W, sceneH - gy);
    for (var k = 0; k < 30; k++) { var tx = ((k * 61 - HC.x * 40) % (W + 60) + W + 60) % (W + 60) - 30; hc.fillStyle = 'rgba(0,0,0,.18)'; hc.fillRect(tx, gy + 6 + (k % 3) * 5, 10, 2); }
    var s = clamp(W / 900, 0.55, 1), hx = W * 0.62, cxp = W * 0.2;
    // cart
    var cw = 120 * s, chh = 50 * s, cTop = gy - 22 * s - chh;
    hc.fillStyle = '#8a6a3c'; rr(hc, cxp - cw / 2, cTop, cw, chh, 5); hc.fill(); hc.fillStyle = '#6e5230'; hc.fillRect(cxp - cw / 2, cTop + chh * 0.45, cw, 4);
    if (HC.mc > 300) { hc.fillStyle = '#c99a5b'; for (var b = 0; b < 3; b++) { rr(hc, cxp - cw / 2 + 8 + b * cw * 0.3, cTop - 22 * s, cw * 0.26, 22 * s, 3); hc.fill(); } }
    [cxp - cw * 0.3, cxp + cw * 0.3].forEach(function (wx) { hc.save(); hc.translate(wx, gy - 16 * s); hc.rotate(HC.x / (16 * s / 40)); hc.strokeStyle = '#3a2a1c'; hc.lineWidth = 4; hc.beginPath(); hc.arc(0, 0, 16 * s, 0, 7); hc.stroke(); hc.lineWidth = 2; for (var q = 0; q < 4; q++) { hc.beginPath(); hc.moveTo(0, 0); hc.lineTo(Math.cos(q * 1.57) * 16 * s, Math.sin(q * 1.57) * 16 * s); hc.stroke(); } hc.restore(); });
    // rope
    var ropeY = cTop + chh * 0.4;
    hc.strokeStyle = '#c99a5b'; hc.lineWidth = 3; hc.beginPath(); hc.moveTo(cxp + cw / 2, ropeY); hc.lineTo(hx - 30 * s, gy - 60 * s); hc.stroke();
    horse(hc, hx, gy, s, HC.gait);
    // forces drawn where they act
    var fsc = Math.min(0.09, W * 0.16 / 2000) * 1.2;
    if (HC.T > 0.5) { arrow(hc, cxp + cw / 2 + 4, ropeY - 10, cxp + cw / 2 + 4 + HC.T * fsc, ropeY - 10, C.violet, 3.5, 9); arrow(hc, hx - 30 * s, gy - 72 * s, hx - 30 * s - HC.T * fsc, gy - 72 * s, C.violet, 3.5, 9); if (HC.pairs) { badge(hc, cxp + cw / 2 + 4 + HC.T * fsc * 0.5, ropeY - 22, 1, C.violet); badge(hc, hx - 30 * s - HC.T * fsc * 0.5, gy - 84 * s, 1, C.violet); } }
    if (HC.Fg > 0.5) { arrow(hc, hx - 10 * s, gy - 4, hx - 10 * s + HC.Fg * fsc, gy - 4, C.red, 3.5, 9); if (HC.pairs) { arrow(hc, hx - 10 * s, gy + 10, hx - 10 * s - HC.Fg * fsc, gy + 10, C.red, 2.5, 8, [5, 4]); badge(hc, hx - 10 * s + HC.Fg * fsc * 0.5, gy - 16, 2, C.red); badge(hc, hx - 10 * s - HC.Fg * fsc * 0.5, gy + 22, 2, C.red); } }
    var fNow = HC.v > 0 || HC.Fg > f ? f : Math.min(HC.Fg, f);
    if (fNow > 0.5) { arrow(hc, cxp, gy - 2, cxp - fNow * fsc, gy - 2, C.red, 3.5, 9); if (HC.pairs) { arrow(hc, cxp, gy + 10, cxp + fNow * fsc, gy + 10, C.red, 2.5, 8, [5, 4]); badge(hc, cxp - fNow * fsc * 0.5, gy - 14, 3, C.red); badge(hc, cxp + fNow * fsc * 0.5, gy + 22, 3, C.red); } }
    txt(hc, fmt(HC.v, 2) + ' m/s', 10, 18, C.gold, '700 13px system-ui,sans-serif');
    if (HC.Fg === 0 && HC.v === 0) txt(hc, 'Use the slider: how hard does the horse push back on the ground?', W / 2, 40, hexA(C.ink, 0.85), 'italic 13px Georgia,serif', 'center');
    if (HC.pairs && !narrow) txt(hc, 'dashed arrows: forces on the ground', W - 10, sceneH - 4, hexA(C.ink, 0.75), '10.5px system-ui,sans-serif', 'right');
    // free-body diagrams
    var top = sceneH + 8, bh = H - top - 6, bw = narrow ? W - 12 : (W - 18) / 2, scale = Math.min(0.06, (bw * 0.36) / Math.max(1200, HC.Fg + 50));
    var netH = HC.Fg - HC.T, netC = HC.T - fNow;
    var hF = [{ F: HC.Fg, dir: [1, 0], col: C.red, label: 'ground', pair: 2 }, { F: HC.T, dir: [-1, 0], col: C.violet, label: 'rope', pair: 1 }];
    var cF = [{ F: HC.T, dir: [1, 0], col: C.violet, label: 'rope', pair: 1 }, { F: fNow, dir: [-1, 0], col: C.red, label: 'road', pair: 3 }];
    if (HC.vert) { hF.push({ F: MH * G, dir: [0, -1], col: C.pink, label: 'weight' }, { F: MH * G, dir: [0, 1], col: C.blue, label: 'ground up' }); cF.push({ F: HC.mc * G, dir: [0, -1], col: C.pink, label: 'weight' }, { F: HC.mc * G, dir: [0, 1], col: C.blue, label: 'road up' }); }
    function scaled(list) { return list.map(function (f) { return f; }); }
    var vScale = scale;
    if (narrow) {
      var bh2 = (bh - 6) / 2;
      fbd(hc, W / 2, top + bh2 / 2, 'Forces on the horse', scaled(hF), netH, vScale, bw, bh2);
      fbd(hc, W / 2, top + bh2 + 6 + bh2 / 2, 'Forces on the cart', scaled(cF), netC, vScale, bw, bh2);
    } else {
      fbd(hc, 6 + bw / 2, top + bh / 2, 'Forces on the horse (' + MH + ' kg)', scaled(hF), netH, vScale, bw, bh);
      fbd(hc, 12 + bw * 1.5, top + bh / 2, 'Forces on the cart (' + HC.mc + ' kg)', scaled(cF), netC, vScale, bw, bh);
    }
    hel.read.innerHTML = '<dt>Ground pushes the horse forward</dt><dd>' + fmt(HC.Fg, 0) + ' N</dd><dt>Rope pulls the cart forward</dt><dd>' + fmt(HC.T, 0) + ' N</dd><dt>Rope pulls the horse back</dt><dd>' + fmt(HC.T, 0) + ' N</dd><dt>Road holds the cart back</dt><dd>' + fmt(fNow, 0) + ' N</dd><dt>Net force on the horse</dt><dd>' + fmt(netH, 0) + ' N</dd><dt>Net force on the cart</dt><dd>' + fmt(netC, 0) + ' N</dd><dt>Acceleration of both</dt><dd>' + fmt(HC.a, 3) + ' m/s²</dd><dt>Speed</dt><dd>' + fmt(HC.v, 2) + ' m/s</dd>';
  }
  LAB.loop(drawHC, hview);

  // =====================================================================================
  // 3. Four small demos
  // =====================================================================================
  var demos = [];
  function demo(id, draw) { var c = $(id); if (!c) return { t: 0 }; var k = LAB.canvas(c), d = { k: k, c: k.c, t: 0, run: false, draw: draw, lw: 0, lh: 0, dirty: true }; demos.push(d); return d; }
  function bg(c, W, H) { var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1d2d'); g.addColorStop(1, '#06111a'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  // -- spring scales --
  var sc = demo('nl3-d-scales', drawScales), scF = 20, scMode = 'wall', scDrag = false;
  function drawScales(d) {
    var c = d.c, W = d.k.w, H = d.k.h, y = H * 0.55, ext = scF / 50;   // each scale stretches up to 3 cm per 50 N (drawn bigger)
    bg(c, W, H);
    var x0 = 30, sw = Math.min(140, (W - 200) / 2), gap = 14, stretch = ext * 40;
    if (scMode === 'wall') { c.fillStyle = '#2c4a60'; c.fillRect(6, y - 50, 14, 100); c.strokeStyle = '#8fb3c6'; c.lineWidth = 1; for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(6, y - 46 + i * 18); c.lineTo(20, y - 56 + i * 18); c.stroke(); } }
    else txt(c, '✋', 16, y + 7, C.ink, '22px system-ui', 'center');
    function scale(xl, label) {
      c.fillStyle = '#c99a5b'; rr(c, xl, y - 14, sw, 28, 6); c.fill();
      c.fillStyle = '#0b1d2d'; rr(c, xl + 10, y - 7, sw - 20, 14, 3); c.fill();
      var p = xl + 10 + (sw - 20) * Math.min(1, scF / 50);
      c.fillStyle = '#ff8787'; c.fillRect(p - 1.5, y - 7, 3, 14);
      for (var k = 0; k <= 5; k++) { c.fillStyle = '#8fb3c6'; c.fillRect(xl + 10 + (sw - 20) * k / 5, y + 7, 1, 4); }
      txt(c, fmt(scF, 0) + ' N', xl + sw / 2, y - 22, C.gold, '700 13px system-ui,sans-serif', 'center');
      txt(c, label, xl + sw / 2, y + 32, C.muted, '11px system-ui,sans-serif', 'center');
    }
    var s1 = x0 + 4, s2 = s1 + sw + gap + stretch;
    c.strokeStyle = '#dbe7ef'; c.lineWidth = 2; c.beginPath(); c.moveTo(20, y); c.lineTo(s1, y); c.moveTo(s1 + sw, y); c.lineTo(s2, y); c.moveTo(s2 + sw, y); c.lineTo(s2 + sw + 18 + stretch, y); c.stroke();
    scale(s1, 'scale 1'); scale(s2, 'scale 2');
    var hx = s2 + sw + 18 + stretch; txt(c, '✊', hx + 10, y + 8, C.ink, '22px system-ui', 'center');
    arrow(c, hx + 24, y - 30, hx + 24 + scF * 1.2, y - 30, C.violet, 3, 8);
    txt(c, 'drag the hand, or use the slider', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  var scIn = $('nl3-d-scale-F'), scOut = $('nl3-d-scale-o');
  function setScale(v) { scF = clamp(Math.round(v), 0, 50); scIn.value = scF; scOut.textContent = scF + ' N'; sc.dirty = true; }
  scIn.addEventListener('input', function () { setScale(+scIn.value); });
  $('nl3-d-scale-mode').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; scMode = b.dataset.end; pressSeg($('nl3-d-scale-mode'), 'end', scMode); sc.dirty = true; });
  var scCv = $('nl3-d-scales');
  scCv.addEventListener('pointerdown', function (e) { scDrag = true; scCv.setPointerCapture(e.pointerId); scMove(e); });
  scCv.addEventListener('pointermove', function (e) { if (scDrag) scMove(e); });
  scCv.addEventListener('pointerup', function () { scDrag = false; }); scCv.addEventListener('pointercancel', function () { scDrag = false; });
  function scMove(e) { var r = scCv.getBoundingClientRect(), W = r.width, sw = Math.min(140, (W - 200) / 2), base = 66 + 2 * sw; setScale(((e.clientX - r.left) - 10 - base) / 2 / 40 * 50); }

  // -- balloon rocket --
  var bl = demo('nl3-d-balloon', drawBalloon), blM = null;
  function startBalloon() { blM = new P.Balloon({ m: 0.01, F0: 0.3, Tb: 1.2, k: 0.009 }); bl.t = 0; bl.run = true; bl.puffs = []; }
  function drawBalloon(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, y = H * 0.45, x0 = 40, sc2 = (W - 90) / 7;
    if (d.run && blM) { var n = Math.round(dt / 1e-3); for (var i = 0; i < n; i++) blM.step(1e-3); if (blM.x > 6.6) { blM.x = 6.6; blM.v = 0; } if (blM.t > 4.5) d.run = false; }
    bg(c, W, H);
    c.strokeStyle = 'rgba(219,231,239,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(10, y); c.lineTo(W - 10, y); c.stroke();
    c.fillStyle = '#2c4a60'; c.fillRect(6, y - 30, 6, 60); c.fillRect(W - 12, y - 30, 6, 60);
    var x = blM ? blM.x : 0, F = blM ? blM.thrust(blM.t) : 0, bx = x0 + x * sc2, size = blM ? 1 - 0.55 * Math.min(1, blM.t / blM.Tb) : 1;
    c.fillStyle = '#ff8787'; c.beginPath(); c.ellipse(bx, y + 18 * size, 30 * size + 6, 18 * size + 4, 0, 0, 7); c.fill();
    c.fillStyle = '#f9a8d4'; c.fillRect(bx - 16, y - 3, 32, 6);
    if (F > 0.01 && !reduced) for (var p = 0; p < 4; p++) { c.fillStyle = 'rgba(219,231,239,' + (0.4 - p * 0.08) + ')'; c.beginPath(); c.arc(bx - 36 * size - 8 - p * 10 - Math.random() * 4, y + 18 * size + (Math.random() - 0.5) * 6, 3 + p, 0, 7); c.fill(); }
    if (F > 0.01) {
      var L = F * 420;
      arrow(c, bx + 10, y - 22, bx + 10 + L, y - 22, C.green, 3, 8); txt(c, 'air pushes balloon', bx + 10, y - 30, C.green, '600 11px system-ui,sans-serif');
      arrow(c, bx - 40 * size - 6, y + 46, bx - 40 * size - 6 - L, y + 46, C.green, 3, 8, [5, 4]); txt(c, 'balloon pushes air', Math.max(4, bx - 40 * size - 6 - L), y + 62, C.green, '600 11px system-ui,sans-serif');
    }
    txt(c, blM ? fmt(blM.v, 2) + ' m/s' : 'let go of the balloon', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  $('nl3-d-balloon-go').addEventListener('click', startBalloon);

  // -- walking on wood and on ice --
  var wk = demo('nl3-d-walk', drawWalk), wkSurf = 'wood', wkRes = null;
  function startWalk() { wkRes = P.walk(50, 1.5, wkSurf === 'wood' ? 0.9 : 0.1, wkSurf === 'wood' ? 0.7 : 0.05); wk.t = 0; wk.run = true; wk.x = 0; wk.v = 0; $('nl3-d-walk-cap').textContent = wkRes.slip ? 'On ice, the ground can push your foot forward with at most 0.1 × your weight: 49 N for a 50 kg walker. You need 75 N to speed up at 1.5 m/s², so your foot slips back, and you get only ' + fmt(wkRes.F, 0) + ' N: ' + fmt(wkRes.a, 2) + ' m/s².' : 'Your foot pushes the floor back with 75 N; the floor pushes you forward with 75 N, and you speed up at 75 ÷ 50 = 1.5 m/s². Shoes on wood could take up to 441 N.'; }
  function drawWalk(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, floor = H * 0.78;
    if (d.run && wkRes) { d.t += dt; d.v = Math.min(1.4, d.v + wkRes.a * dt); d.x += d.v * dt; if (d.t > 3.2) d.run = false; }
    bg(c, W, H);
    c.fillStyle = wkSurf === 'wood' ? '#8a6a3c' : '#a5d8ff'; c.fillRect(0, floor, W, H - floor);
    if (wkSurf === 'wood') { c.fillStyle = 'rgba(0,0,0,.15)'; for (var k = 0; k < 12; k++) c.fillRect(((k * 83 - (d.x || 0) * 0) % W + W) % W, floor + 6, 1, H - floor); }
    var px = 60 + (d.x || 0) * (W - 110) / 3.5, ph = Math.min(100, floor - 50), stride = Math.sin((d.t || 0) * 9) * (d.run ? 1 : 0);
    var slipping = wkRes && wkRes.slip && d.run;
    person(c, px, floor, ph, 1, '#ffd479', 0.2, stride * 0.15, false);
    if (d.run && wkRes) {
      var L = wkRes.F * 0.9, fx = px + (slipping ? -6 + Math.sin(d.t * 18) * 4 : 0);
      arrow(c, fx, floor + 10, fx - L, floor + 10, C.red, 3, 8, [5, 4]);
      arrow(c, fx, floor - 6, fx + L, floor - 6, C.red, 3, 8);
      txt(c, '→ ground pushes you forward: ' + fmt(wkRes.F, 0) + ' N', W - 10, 18, C.red, '600 11px system-ui,sans-serif', 'right');
      txt(c, '⇠ your foot pushes the ground back: ' + fmt(wkRes.F, 0) + ' N', W - 10, 34, C.red, '600 11px system-ui,sans-serif', 'right');
      if (slipping) txt(c, 'slip!', px + 16, floor - ph * 0.75, C.red, '700 13px system-ui,sans-serif');
    }
    txt(c, wkRes ? fmt(d.v || 0, 2) + ' m/s' : 'press Walk', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  $('nl3-d-walk-go').addEventListener('click', startWalk);
  $('nl3-d-surf').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; wkSurf = b.dataset.surf; pressSeg($('nl3-d-surf'), 'surf', wkSurf); wkRes = null; wk.x = 0; wk.v = 0; wk.t = 0; wk.dirty = true; });

  // -- throwing a medicine ball from a skateboard --
  var th = demo('nl3-d-throw', drawThrow);
  var TM = 50, BM = 5, BV = 4, TT = 0.3;           // skater + board (kg), ball (kg), throw speed (m/s), throw time (s)
  function startThrow() { th.t = 0; th.run = true; }
  function drawThrow(d, dt) {
    var c = d.c, W = d.k.w, H = d.k.h, floor = H * 0.8, sc3 = (W - 60) / 6;
    if (d.run) { d.t += dt * 0.5; if (d.t > 3) d.run = false; }
    var t = d.t, F = t > 0 && t < TT ? BM * BV / TT : 0, vS = t <= 0 ? 0 : -Math.min(t, TT) / TT * BM * BV / TM, vB = t <= 0 ? 0 : Math.min(t, TT) / TT * BV;
    var xS = t < TT ? 0.5 * vS * t : 0.5 * vS * TT + vS * (t - TT), xB = t < TT ? 0.5 * vB * t : 0.5 * vB * TT + vB * (t - TT);
    bg(c, W, H); c.fillStyle = '#2c3e50'; c.fillRect(0, floor, W, H - floor);
    var px = W * 0.35 + xS * sc3, ph = Math.min(100, floor - 26);
    c.fillStyle = '#c99a5b'; rr(c, px - 26, floor - 10, 52, 6, 3); c.fill(); c.fillStyle = '#0d1a24'; [px - 18, px + 18].forEach(function (w) { c.beginPath(); c.arc(w, floor - 3, 4, 0, 7); c.fill(); });
    person(c, px, floor - 10, ph, 1, '#74c0fc', t > 0 ? 1 : 0.4, 0, false);
    var bxp = t <= 0 ? px + ph * 0.3 : W * 0.35 + ph * 0.3 + xB * sc3, by = floor - 10 - ph * 0.82 + 0.5 * G * Math.pow(Math.max(0, t - TT), 2) * sc3;
    c.fillStyle = '#ff8787'; c.beginPath(); c.arc(Math.min(W - 10, bxp + 10), Math.min(floor - 9, by), 9, 0, 7); c.fill();
    if (F > 0) { arrow(c, px + ph * 0.3, floor - ph * 0.95, px + ph * 0.3 + F * 0.5, floor - ph * 0.95, C.green, 3, 8); txt(c, 'hand pushes ball ' + fmt(F, 0) + ' N', px + ph * 0.3, floor - ph * 0.95 - 8, C.green, '600 10.5px system-ui,sans-serif'); arrow(c, px + ph * 0.2, floor - ph * 0.7, px + ph * 0.2 - F * 0.5, floor - ph * 0.7, C.green, 3, 8, [5, 4]); txt(c, 'ball pushes hand ' + fmt(F, 0) + ' N', Math.max(4, px + ph * 0.2 - F * 0.5 - 4), floor - ph * 0.7 + 18, C.green, '600 10.5px system-ui,sans-serif'); }
    txt(c, t > 0 ? 'ball ' + fmt(vB, 1) + ' m/s →   ← you ' + fmt(-vS, 2) + ' m/s' : 'press Throw', 10, 18, C.gold, '600 12px system-ui,sans-serif');
  }
  $('nl3-d-throw-go').addEventListener('click', startThrow);

  var demoWrap = $('nl3-demos');
  if (demoWrap) LAB.loop(function (dt) { demos.forEach(function (d) { d.k.fit(); if (!d.run && d.lw === d.k.w && d.lh === d.k.h && !d.dirty) return; d.draw(d, dt); d.lw = d.k.w; d.lh = d.k.h; d.dirty = d.run; }); }, demoWrap);
})();
