/* Energy and the First Law: the page. Runs the piston-and-cylinder simulation (P–V diagram, energy bars, missions),
   Joule's paddle wheel, the food-Calorie converter and the car energy-flow diagram. The models live in physics.js
   (window.ThermoFirst). */
(function () {
  'use strict';
  var LAB = window.TRBLab, F = window.ThermoFirst;
  var root = document.getElementById('th2-lab');
  if (!root || !LAB || !F) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced;
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.22)', red: '#ff8787', gold: '#ffd479', blue: '#74c0fc', green: '#63e6be', pink: '#f9a8d4' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var STOPS = [[0, [116, 192, 252]], [40, [150, 140, 205]], [70, [255, 135, 135]], [100, [255, 212, 121]]];
  function trgb(T) { T = clamp(T, 0, 100); for (var i = 1; i < STOPS.length; i++) if (T <= STOPS[i][0]) { var a = STOPS[i - 1], b = STOPS[i], f = (T - a[0]) / (b[0] - a[0]); return [lerp(a[1][0], b[1][0], f), lerp(a[1][1], b[1][1], f), lerp(a[1][2], b[1][2], f)]; } return STOPS[3][1]; }
  function tcol(T, alpha) { var c = trgb(T); return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (alpha === undefined ? 1 : alpha) + ')'; }
  function J(v) { return fmt(v, Math.abs(v) >= 100 ? 0 : 1) + ' J'; }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arcTo(x + w, y, x + w, y + r, r); g.lineTo(x + w, y + h - r); g.arcTo(x + w, y + h, x + w - r, y + h, r); g.lineTo(x + r, y + h); g.arcTo(x, y + h, x, y + h - r, r); g.lineTo(x, y + r); g.arcTo(x, y, x + r, y, r); g.closePath(); }

  // ======================================================================= the piston
  var view = $('th2-view'), cv = $('th2-cv'), K = LAB.canvas(cv), ctx = K.c, hud = $('th2-hud');
  var ui = LAB.store('thermo-first-ui');
  var gas = new F.Piston();
  var PRESETS = {
    isochoric: { mode: 'locked', heat: 'flame', weights: 0, note: 'Piston locked, flame on. The volume can’t change, so W = 0 and every joule of heat goes into internal energy.' },
    isobaric: { mode: 'weights', heat: 'flame', weights: 2, note: 'Two weights ride on the piston, so the pressure stays fixed. Heat it: the gas expands and lifts them.' },
    isothermal: { mode: 'hand', heat: 'bath', weights: 0, note: 'The cylinder sits in a big 300 K water bath. Move the piston slowly: the temperature hardly changes.' },
    adiabatic: { mode: 'hand', heat: 'insulated', weights: 0, note: 'Wrapped in insulation: no heat in or out. Push the piston in, or pull it out, and watch the temperature.' }
  };
  var S = { pre: 'isochoric', paused: false, parts: [], path: [], loopFrom: 0, loops: [], runFrom: 0, run: null, pScale: 250, qRate: 0, wRate: 0, uiClock: 0, t: 0, drag: false, flash: 0 };
  var el = {
    presets: $('th2-presets'), note: $('th2-note'), heat: $('th2-heat'), mode: $('th2-mode'), wrow: $('th2-wrow'), wminus: $('th2-wminus'), wplus: $('th2-wplus'), wcount: $('th2-wcount'),
    vrow: $('th2-vrow'), v: $('th2-v'), vo: $('th2-v-o'), zero: $('th2-zero'), pause: $('th2-pause'), reset: $('th2-reset'),
    rp: $('th2-rp'), rv: $('th2-rv'), rt: $('th2-rt'), ru: $('th2-ru'), rq: $('th2-rq'), rw: $('th2-rw'), rdu: $('th2-rdu'), rchk: $('th2-rchk')
  };
  var MISSIONS = [
    { id: 'lockheat', title: 'All into the gas', goal: 'Lock the piston and heat the gas with 60 J or more: W stays 0 and ΔU = Q.' },
    { id: 'lift', title: 'Heat lifts weights', goal: 'With weights on the piston, heat the gas until it has done 30 J of work lifting them.' },
    { id: 'pump', title: 'Bike pump', goal: 'Insulated, no flame: raise the temperature by 100 K or more using only work.' },
    { id: 'cool', title: 'Cool by expanding', goal: 'Insulated: let the gas do work and cool itself by 80 K or more.' },
    { id: 'isowork', title: 'Work without warming', goal: 'In the bath, make the gas do 60 J of work (or have 60 J done on it) while ΔU stays within 3 J.' },
    { id: 'loop', title: 'Close the loop', goal: 'Bring the path on the P–V diagram back across itself, enclosing at least 20 J.' },
    { id: 'engine', title: 'Build an engine', goal: 'Go clockwise around a loop that encloses 80 J or more: net heat in becomes net work out.' }
  ];
  var PICK = {
    lockheat: ['isochoric', 'Watch the bars: Q and ΔU climb together.'], lift: ['isobaric', 'The flame is on. Wait for the weights to rise.'],
    pump: ['adiabatic', 'Drag the piston down, or press ↓.'], cool: ['adiabatic', 'Drag the piston up, or press ↑.'],
    isowork: ['isothermal', 'Move the piston slowly up or down and keep going.'], loop: ['isothermal', 'Try: flame, push in; ice, pull out… any path that crosses itself.'],
    engine: ['isochoric', 'Heat while locked, then “Your hand”: pull out with the flame on, switch to ice and push back in.']
  };
  var MS = LAB.missions($('th2-missions'), 'thermo-first', MISSIONS, function (id) { var p = PICK[id]; if (!p) return; loadPreset(p[0]); toastQ = []; toastAt = -10; say(p[1]); });
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pump(); }
  function pump() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.8) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  var burst = [];
  function win(id, text) { if (MS.done(id)) { var m = MISSIONS.filter(function (x) { return x.id === id; })[0]; say('✓ ' + m.title + ': ' + text); if (!reduced) for (var i = 0; i < 40; i++) { var a = Math.random() * 6.283, v = 60 + Math.random() * 170; burst.push({ x: K.w * 0.6, y: K.h * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 1, c: [C.green, C.gold, C.pink, C.red][i % 4] }); } } }

  function loadPreset(id) {
    var p = PRESETS[id] || PRESETS.isochoric; S.pre = PRESETS[id] ? id : 'isochoric'; ui.set('pre', S.pre);
    gas = new F.Piston({ mode: p.mode, heat: p.heat, weights: p.weights });
    gas.T = 300; gas.V = gas.n * F.R * 300 / gas.targetPExt(); gas.pExt = gas.targetPExt(); gas.handV = gas.V; gas.bathT = 300; gas.zero();
    zeroTrace(); el.note.textContent = p.note; markSeg(el.presets, 'data-pre', S.pre); syncControls(); newRun();
  }
  function zeroTrace() { gas.zero(); S.path = []; S.loops = []; S.loopFrom = 0; S.runFrom = 0; S.pScale = niceP(gas.P() / 1000 * 1.25); addPoint(true); newRun(); }
  function newRun() { S.run = { key: gas.heat + '|' + gas.mode, T0: gas.T, V0: gas.V, Q0: gas.Q, W0: gas.W, U0: gas.U(), dUmax: 0 }; S.runFrom = Math.max(0, S.path.length - 1); }
  function markSeg(box, attr, val) { var bs = box.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute(attr) === val ? 'true' : 'false'); }
  function syncControls() {
    markSeg(el.heat, 'data-h', gas.heat); markSeg(el.mode, 'data-m', gas.mode);
    el.wrow.hidden = gas.mode !== 'weights'; el.wcount.textContent = gas.weights + (gas.weights === 1 ? ' weight' : ' weights') + ' · +' + fmt(gas.weights * F.WEIGHT * F.G0 / F.AREA / 1000, 1) + ' kPa';
    el.v.value = (gas.mode === 'hand' ? gas.handV : gas.V) * 1000; el.vo.textContent = fmt(gas.V * 1000, 2) + ' L';
  }
  var HEATNOTE = { insulated: 'insulation around the cylinder (no heat flow)', flame: 'a flame under the cylinder', ice: 'ice under the cylinder', bath: 'the cylinder in a 300 K water bath' }, MODENOTE = { locked: 'the piston locked', weights: 'weights riding on the piston', hand: 'the piston in your hand' };
  function customNote() { el.note.textContent = 'Your own process: ' + HEATNOTE[gas.heat] + ', and ' + MODENOTE[gas.mode] + '.'; }
  function setHeat(h) { if (gas.heat === h) return; gas.heat = h; S.pre = null; markSeg(el.presets, 'data-pre', ''); syncControls(); newRun(); customNote(); }
  function setMode(m) { if (gas.mode === m) return; if (m === 'hand') gas.handV = gas.V; if (m === 'weights') gas.pExt = gas.P(); gas.mode = m; S.pre = null; markSeg(el.presets, 'data-pre', ''); syncControls(); newRun(); customNote(); }
  function setWeights(n) { gas.weights = clamp(n, 0, 6); syncControls(); }
  function setPaused(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }

  el.presets.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; loadPreset(b.getAttribute('data-pre')); toastQ = []; toastAt = -10; });
  el.heat.addEventListener('click', function (e) { var b = e.target.closest('button[data-h]'); if (b) setHeat(b.getAttribute('data-h')); });
  el.mode.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (b) setMode(b.getAttribute('data-m')); });
  el.wminus.addEventListener('click', function () { setWeights(gas.weights - 1); });
  el.wplus.addEventListener('click', function () { setWeights(gas.weights + 1); });
  el.v.addEventListener('input', function () { setMode('hand'); gas.handV = +el.v.value / 1000; });
  el.zero.addEventListener('click', function () { zeroTrace(); say('Meters at zero. The trace starts here.'); });
  el.pause.addEventListener('click', function () { setPaused(!S.paused); });
  el.reset.addEventListener('click', function () { loadPreset(S.pre || 'isochoric'); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'ArrowUp' || k === 'ArrowDown') { setMode('hand'); gas.handV = clamp(gas.handV + (k === 'ArrowUp' ? 0.1e-3 : -0.1e-3), F.VMIN, F.VMAX); syncControls(); }
    else if (k === 'f' || k === 'F') setHeat('flame'); else if (k === 'i' || k === 'I') setHeat('ice'); else if (k === 'b' || k === 'B') setHeat('bath'); else if (k === 'n' || k === 'N') setHeat('insulated');
    else if (k === 'l' || k === 'L') setMode('locked'); else if (k === 'w' || k === 'W') setMode('weights'); else if (k === 'h' || k === 'H') setMode('hand');
    else if (k === '+' || k === '=') { setMode('weights'); setWeights(gas.weights + 1); } else if (k === '-' || k === '_') { setMode('weights'); setWeights(gas.weights - 1); }
    else if (k === 'z' || k === 'Z') zeroTrace(); else if (k === 'p' || k === 'P' || k === ' ') setPaused(!S.paused);
    else used = false;
    if (used) e.preventDefault();
  });

  // ---------- the trace on the P–V diagram ----------
  function niceP(p) { var st = [200, 250, 300, 400, 500, 600, 800, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000]; for (var i = 0; i < st.length; i++) if (p <= st[i]) return st[i]; return Math.ceil(p / 1000) * 1000; }
  function addPoint(force) {
    var V = gas.V * 1000, P = gas.P() / 1000, last = S.path[S.path.length - 1];
    if (!force && last && Math.abs(V - last.V) / 5 < 0.003 && Math.abs(P - last.P) / S.pScale < 0.003) return false;
    var kind = 0;
    if (last) { var dq = gas.Q - last.q; kind = Math.abs(dq) < 0.02 ? 0 : dq > 0 ? 1 : -1; }
    S.path.push({ V: V, P: P, q: gas.Q, w: gas.W, kind: kind, len: last ? last.len + Math.hypot((V - last.V) / 5, (P - last.P) / S.pScale) : 0 });
    if (P * 1.08 > S.pScale) S.pScale = niceP(P * 1.15);
    if (S.path.length > 4000) { S.path.splice(0, 1000); S.loopFrom = Math.max(0, S.loopFrom - 1000); S.runFrom = Math.max(0, S.runFrom - 1000); }
    return true;
  }
  // a loop closes when the newest piece of the path crosses an older piece: cut it out exactly at the crossing
  function findLoop() {
    var n = S.path.length; if (n < 6) return;
    var a = S.path[n - 2], b = S.path[n - 1], sx = S.pScale;
    var ax = a.V / 5, ay = a.P / sx, bx = b.V / 5, by = b.P / sx;
    for (var j = S.loopFrom; j < n - 4; j++) {
      var c = S.path[j], d = S.path[j + 1];
      if (b.len - d.len < 0.04) break;
      var cx = c.V / 5, cy = c.P / sx, dx = d.V / 5, dy = d.P / sx;
      var den = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx); if (Math.abs(den) < 1e-14) continue;
      var u = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / den, v = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / den;
      if (u < 0 || u > 1 || v < 0 || v > 1) continue;
      var X = [a.V + u * (b.V - a.V), a.P + u * (b.P - a.P)];
      var pts = [X]; for (var k = j + 1; k <= n - 2; k++) pts.push([S.path[k].V, S.path[k].P]);
      var area = F.loopArea(pts);                                   // L·kPa = J
      var Wl = (a.w + u * (b.w - a.w)) - (c.w + v * (d.w - c.w)), Ql = (a.q + u * (b.q - a.q)) - (c.q + v * (d.q - c.q));
      if (Math.abs(area) < 1) continue;
      S.loops.push({ pts: pts, W: Wl, area: area, Q: Ql, born: S.t }); if (S.loops.length > 6) S.loops.shift();
      S.loopFrom = n - 2;
      say((area > 0 ? 'Clockwise loop: net work by the gas ' : 'Counterclockwise loop: net work done on the gas ') + J(Math.abs(Wl)) + ', net heat ' + (Ql >= 0 ? 'in ' : 'out ') + J(Math.abs(Ql)) + '. Same state again, so ΔU = 0.');
      if (Math.abs(Wl) >= 20) win('loop', 'the area inside is ' + J(Math.abs(area)) + ', the net work.');
      if (Wl >= 80) win('engine', J(Ql) + ' of net heat in became ' + J(Wl) + ' of net work out.');
      return;
    }
  }
  function checkRun() {
    var r = S.run; if (!r) return;
    var key = gas.heat + '|' + gas.mode; if (key !== r.key) { newRun(); return; }
    var Q = gas.Q - r.Q0, W = gas.W - r.W0, dU = gas.U() - r.U0, dT = gas.T - r.T0;
    if (gas.mode === 'locked' && gas.heat === 'flame' && Q >= 60) win('lockheat', 'Q = ' + J(Q) + ', W = 0, ΔU = ' + J(dU) + '.');
    if (gas.mode === 'weights' && gas.heat === 'flame' && W >= 30 && gas.V > r.V0) win('lift', 'of ' + J(Q) + ' heat, ' + J(W) + ' went out as work (' + fmt(W / Q * 100, 0) + '%) and ' + J(dU) + ' stayed in the gas.');
    if (gas.heat === 'insulated' && dT >= 100 && W < 0) win('pump', 'Q = 0, W = ' + J(W) + ', and T rose ' + fmt(dT, 0) + ' K.');
    if (gas.heat === 'insulated' && dT <= -80 && W > 0) win('cool', 'the gas did ' + J(W) + ' of work and paid for it with ' + J(-dU) + ' of internal energy.');
    if (gas.heat === 'bath' && Math.abs(W) >= 60 && Math.abs(dU) < 3) win('isowork', 'W = ' + J(W) + ', Q = ' + J(Q) + ', ΔU = ' + J(dU) + '.');
  }

  // ---------- particles (for the look) ----------
  var NP = 90;
  function initParts() { S.parts = []; for (var i = 0; i < NP; i++) { var a = Math.random() * 6.283; S.parts.push({ x: Math.random(), y: Math.random(), vx: Math.cos(a), vy: Math.sin(a) }); } }
  initParts();

  // ---------- layout ----------
  var R = {};
  function layout() {
    var w = K.w, h = K.h; R.w = w; R.h = h; R.wide = w >= 640;
    if (R.wide) {
      var cw = Math.round(clamp(w * 0.36, 230, 330));
      R.cyl = { x: 12, y: 58, w: cw, h: h - 70 };
      var px = cw + 30; R.pv = { x: px, y: 58, w: w - px - 14, h: Math.round((h - 72) * 0.6) };
      R.bars = { x: px, y: R.pv.y + R.pv.h + 12, w: w - px - 14, h: h - (R.pv.y + R.pv.h + 12) - 12 };
    } else {
      var top = 64, ch = Math.round((h - top) * 0.52);
      R.cyl = { x: 6, y: top, w: Math.round(w * 0.5), h: ch };
      R.bars = { x: Math.round(w * 0.5) + 10, y: top, w: w - Math.round(w * 0.5) - 18, h: ch };
      R.pv = { x: 8, y: top + ch + 10, w: w - 16, h: h - top - ch - 18 };
    }
    var c = R.cyl, below = R.wide ? 62 : 46, above = R.wide ? 104 : 80;
    R.cw = Math.min(c.w * 0.62, R.wide ? 168 : 120); R.cx0 = c.x + (c.w - R.cw) / 2; R.cx1 = R.cx0 + R.cw;
    R.yB = c.y + c.h - below; R.yT = c.y + above; R.Hc = R.yB - R.yT;
  }
  function pistonY(V) { return R.yB - V / F.VMAX * R.Hc; }

  // ---------- pointer: drag the piston ----------
  function ptr(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function nearPiston(p) { var py = pistonY(gas.V); return p.x > R.cx0 - 30 && p.x < R.cx1 + 30 && p.y > py - (gas.mode === 'weights' ? 100 : 60) && p.y < py + 22; }
  cv.addEventListener('pointerdown', function (e) {
    var p = ptr(e); if (!nearPiston(p)) return;
    if (gas.mode !== 'hand') { setMode('hand'); say('Your hand is on the piston now.'); }
    S.drag = true; try { cv.setPointerCapture(e.pointerId); } catch (err) { } e.preventDefault(); drag(p);
  });
  function drag(p) { gas.handV = clamp((R.yB - p.y) / R.Hc * F.VMAX, F.VMIN, F.VMAX); el.v.value = gas.handV * 1000; }
  cv.addEventListener('pointermove', function (e) { var p = ptr(e); if (S.drag) drag(p); else cv.style.cursor = nearPiston(p) ? 'ns-resize' : 'default'; });
  cv.addEventListener('pointerup', function () { S.drag = false; }); cv.addEventListener('pointercancel', function () { S.drag = false; });

  // ---------- frame ----------
  function frame(dt) {
    if (!R.w) layout();
    pump();
    if (!S.paused) {
      var r = gas.step(dt);
      S.qRate = lerp(S.qRate, r.q / dt, Math.min(1, dt * 6)); S.wRate = lerp(S.wRate, r.w / dt, Math.min(1, dt * 6));
      if (addPoint(false)) findLoop();
      checkRun();
    }
    S.t += dt; draw(dt);
    S.uiClock -= dt; if (S.uiClock <= 0) { S.uiClock = 0.15; readouts(); }
  }
  function readouts() {
    var P = gas.P() / 1000, V = gas.V * 1000, T = gas.T;
    el.rp.textContent = fmt(P, 1) + ' kPa'; el.rv.textContent = fmt(V, 2) + ' L'; el.rt.textContent = fmt(T, 0) + ' K (' + fmt(T - 273.15, 0) + ' °C)';
    el.ru.textContent = fmt(gas.U(), 1) + ' J'; el.rq.textContent = fmt(gas.Q, 1) + ' J'; el.rw.textContent = fmt(gas.W, 1) + ' J'; el.rdu.textContent = fmt(gas.dU(), 1) + ' J';
    var chk = gas.Q - gas.W - gas.dU(); el.rchk.textContent = fmt(Math.abs(chk) < 5e-4 ? 0 : chk, 3) + ' J ✓'; el.rchk.className = 'ok';
    if (gas.mode !== 'hand') { el.v.value = V; } el.vo.textContent = fmt(V, 2) + ' L';
    var qr = S.qRate, wr = S.wRate;
    var nar = K.w < 640;
    hud.innerHTML = '<b>P</b> ' + fmt(P, nar ? 0 : 1) + ' kPa · <b>V</b> ' + fmt(V, 2) + ' L · <b>T</b> ' + fmt(T, 0) + ' K' + (nar ? '' : ' (' + fmt(T - 273.15, 0) + ' °C)') + (S.paused ? ' · paused' : '') +
      '<br>' + (Math.abs(qr) > 0.05 ? '<span style="color:' + (qr > 0 ? C.red : C.blue) + '">heat ' + (qr > 0 ? 'in ' : 'out ') + fmt(Math.abs(qr), nar ? 0 : 1) + ' W</span>' : 'no heat flow') + ' · ' + (Math.abs(wr) > 0.05 ? '<span style="color:' + C.green + '">work ' + (nar ? '' : 'by gas ') + fmt(wr, nar ? 0 : 1) + ' W</span>' : 'no work');
  }

  // ---------- drawing ----------
  function draw(dt) {
    if (K.w !== R.w || K.h !== R.h) layout();
    ctx.clearRect(0, 0, K.w, K.h);
    drawCylinder(dt); drawPV(); drawBars();
    for (var i = burst.length - 1; i >= 0; i--) { var p = burst[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.life -= dt * 0.8; if (p.life <= 0) { burst.splice(i, 1); continue; } ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); ctx.globalAlpha = 1; }
  }
  function drawCylinder(dt) {
    var x0 = R.cx0, x1 = R.cx1, yB = R.yB, yT = R.yT, py = pistonY(gas.V), wall = 7, T = gas.T, heat = gas.heat;
    // bath water around it
    if (heat === 'bath') {
      var bx0 = x0 - 26, bx1 = x1 + 26, by0 = yT + R.Hc * 0.15;
      ctx.fillStyle = 'rgba(116,192,252,.16)'; ctx.fillRect(bx0, by0, bx1 - bx0, yB + 24 - by0);
      ctx.strokeStyle = 'rgba(116,192,252,.6)'; ctx.lineWidth = 1.5; ctx.strokeRect(bx0, by0, bx1 - bx0, yB + 24 - by0);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath();
      for (var k = 0; k <= 20; k++) { var xx = bx0 + (bx1 - bx0) * k / 20, yy = by0 + Math.sin(S.t * (reduced ? 0 : 2) + k) * 1.6; if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke();
      ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = C.blue; ctx.textAlign = 'center'; ctx.fillText('water bath, 300 K', (x0 + x1) / 2, yB + 40);
    }
    // gas glow
    var gg = ctx.createLinearGradient(0, py, 0, yB); gg.addColorStop(0, tcol(gasColor(T), 0.10)); gg.addColorStop(1, tcol(gasColor(T), 0.26));
    ctx.fillStyle = gg; ctx.fillRect(x0, py, x1 - x0, yB - py);
    // particles
    var vt = Math.min(560, 150 * Math.sqrt(T / 300)), ms = 0, i, p, top = py + 7, W = x1 - x0 - 8, H = Math.max(4, yB - top - 4);
    for (i = 0; i < S.parts.length; i++) {
      p = S.parts[i]; var sx = p.vx, sy = p.vy;
      if (!S.paused && !reduced) { p.x += sx * dt / W; p.y += sy * dt / H; }
      if (p.x < 0) { p.x = -p.x; p.vx = Math.abs(p.vx); } if (p.x > 1) { p.x = 2 - p.x; p.vx = -Math.abs(p.vx); }
      if (p.y < 0) { p.y = -p.y; p.vy = Math.abs(p.vy); } if (p.y > 1) { p.y = 2 - p.y; p.vy = -Math.abs(p.vy); }
      p.x = clamp(p.x, 0, 1); p.y = clamp(p.y, 0, 1); ms += p.vx * p.vx + p.vy * p.vy;
    }
    var scale = ms > 0 ? vt / Math.sqrt(ms / S.parts.length) : 1;
    for (i = 0; i < S.parts.length; i++) {
      p = S.parts[i]; p.vx *= scale; p.vy *= scale;
      var v = Math.hypot(p.vx, p.vy), c = clamp(v / 150 * 38, 0, 100), X = x0 + 4 + p.x * W, Y = top + 2 + p.y * H;
      ctx.fillStyle = tcol(c, 0.22); ctx.beginPath(); ctx.arc(X, Y, 5, 0, 7); ctx.fill();
      ctx.fillStyle = tcol(c); ctx.beginPath(); ctx.arc(X, Y, 2.4, 0, 7); ctx.fill();
    }
    // walls
    var mg = ctx.createLinearGradient(x0 - wall, 0, x0, 0); mg.addColorStop(0, '#4a5b68'); mg.addColorStop(1, '#a9bccb');
    ctx.fillStyle = mg; ctx.fillRect(x0 - wall, yT - 12, wall, yB - yT + 12 + wall);
    var mg2 = ctx.createLinearGradient(x1, 0, x1 + wall, 0); mg2.addColorStop(0, '#a9bccb'); mg2.addColorStop(1, '#4a5b68');
    ctx.fillStyle = mg2; ctx.fillRect(x1, yT - 12, wall, yB - yT + 12 + wall);
    ctx.fillStyle = '#7d909e'; ctx.fillRect(x0 - wall, yB, x1 - x0 + 2 * wall, wall);
    // stops
    ctx.fillStyle = '#c4d3de'; [pistonY(F.VMIN), pistonY(F.VMAX) - 10].forEach(function (y) { ctx.fillRect(x0, y + 10, 5, 4); ctx.fillRect(x1 - 5, y + 10, 5, 4); });
    // insulation jacket
    if (heat === 'insulated') {
      ctx.save(); ctx.fillStyle = 'rgba(249,168,212,.22)'; ctx.strokeStyle = 'rgba(249,168,212,.55)'; ctx.lineWidth = 1;
      [[x0 - wall - 14, yT - 12, 14, yB - yT + 12 + wall + 14], [x1 + wall, yT - 12, 14, yB - yT + 12 + wall + 14], [x0 - wall - 14, yB + wall, x1 - x0 + 2 * wall + 28, 14]].forEach(function (r) {
        ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.save(); ctx.beginPath(); ctx.rect(r[0], r[1], r[2], r[3]); ctx.clip(); ctx.beginPath();
        for (var s = -r[3]; s < r[2]; s += 7) { ctx.moveTo(r[0] + s, r[1] + r[3]); ctx.lineTo(r[0] + s + r[3], r[1]); }
        ctx.stroke(); ctx.restore();
      });
      ctx.restore();
      ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = C.pink; ctx.textAlign = 'center'; ctx.fillText('insulated: Q = 0', (x0 + x1) / 2, yB + wall + 30);
    }
    // flame or ice
    var cxm = (x0 + x1) / 2;
    if (heat === 'flame') {
      for (var f = 0; f < 5; f++) {
        var fx = cxm + (f - 2) * R.cw * 0.16, fh = 26 + 8 * Math.sin(S.t * (reduced ? 0 : 9) + f * 1.7), fw = 11;
        var fg = ctx.createLinearGradient(0, yB + wall + 34, 0, yB + wall + 34 - fh); fg.addColorStop(0, 'rgba(116,192,252,.9)'); fg.addColorStop(0.35, 'rgba(255,212,121,.95)'); fg.addColorStop(1, 'rgba(255,135,135,0)');
        ctx.fillStyle = fg; ctx.beginPath(); ctx.moveTo(fx - fw, yB + wall + 34); ctx.quadraticCurveTo(fx - fw * 0.8, yB + wall + 34 - fh * 0.6, fx, yB + wall + 34 - fh); ctx.quadraticCurveTo(fx + fw * 0.8, yB + wall + 34 - fh * 0.6, fx + fw, yB + wall + 34); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#3a4650'; ctx.fillRect(cxm - R.cw * 0.42, yB + wall + 34, R.cw * 0.84, 6);
    } else if (heat === 'ice') {
      for (var q = 0; q < 4; q++) { var ix = cxm + (q - 1.5) * R.cw * 0.22 - 12, iy = yB + wall + 6 + (q % 2) * 3; ctx.fillStyle = 'rgba(200,235,255,.75)'; rr(ctx, ix, iy, 24, 22, 4); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(ix + 4, iy + 4, 6, 3); }
      ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = C.blue; ctx.textAlign = 'center'; ctx.fillText('ice, 0 °C', cxm, yB + wall + 44);
    }
    // heat arrows
    var qr = S.qRate;
    if (Math.abs(qr) > 0.5) {
      var n = clamp(Math.round(Math.log(1 + Math.abs(qr)) * 1.3), 1, 6), up = qr > 0, col = up ? C.red : C.blue;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2.2;
      for (var a = 0; a < n; a++) {
        var ax = cxm + (a - (n - 1) / 2) * 18, ph = reduced ? 0.5 : ((S.t * 0.9 + a * 0.37) % 1), ay = up ? yB - 6 - ph * 34 : yB - 40 + ph * 34;
        ctx.globalAlpha = 0.9 * Math.sin(ph * Math.PI); ctx.beginPath(); ctx.moveTo(ax, ay + (up ? 14 : -14)); ctx.lineTo(ax, ay); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ax - 5, ay + (up ? 6 : -6)); ctx.lineTo(ax, ay); ctx.lineTo(ax + 5, ay + (up ? 6 : -6)); ctx.stroke(); ctx.globalAlpha = 1;
      }
    }
    // the piston
    var pg = ctx.createLinearGradient(0, py, 0, py + 10); pg.addColorStop(0, '#dfe8ef'); pg.addColorStop(1, '#7f93a3');
    ctx.fillStyle = pg; ctx.fillRect(x0, py, x1 - x0, 10);
    ctx.fillStyle = '#9fb2c1'; ctx.fillRect(cxm - 4, py - 34, 8, 34);
    if (gas.mode === 'weights') {
      for (var wi = 0; wi < gas.weights; wi++) {
        var whh = R.wide ? 13 : 10, wy = py - 10 - (wi + 1) * whh, ww = R.cw * 0.7; ctx.fillStyle = wi % 2 ? '#5b6a77' : '#6c7c8a'; rr(ctx, cxm - ww / 2, wy, ww, whh - 1, 3); ctx.fill();
        ctx.fillStyle = '#e6eef4'; ctx.font = '600 ' + (R.wide ? 9 : 8) + 'px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('20 kg', cxm, wy + whh - 4);
      }
      ctx.font = '600 10.5px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center';
      ctx.fillText('outside: ' + fmt(gas.pExt / 1000, 1) + ' kPa', cxm, py - 16 - gas.weights * (R.wide ? 13 : 10));
    } else if (gas.mode === 'locked') {
      ctx.fillStyle = '#ff8787'; ctx.fillRect(x0 - wall - 8, py + 2, 10, 6); ctx.fillRect(x1 - 2, py + 2, wall + 10, 6);
      ctx.font = '15px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🔒', cxm, py - 40);
    } else {
      rr(ctx, cxm - 26, py - 46, 52, 14, 7); ctx.fillStyle = S.drag ? C.gold : '#c4d3de'; ctx.fill();
      ctx.font = '600 10.5px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(S.drag ? '' : '⇕ drag', cxm, py - 52);
    }
    // work arrow on the piston
    var wr = S.wRate;
    if (Math.abs(wr) > 1) {
      var upw = wr > 0; ctx.strokeStyle = C.green; ctx.fillStyle = C.green; ctx.lineWidth = 3;
      var ax2 = x0 - wall - (heat === 'insulated' ? 26 : 14), ay0 = py + 5, ay1 = ay0 + (upw ? -26 : 26);
      ctx.beginPath(); ctx.moveTo(ax2, ay0); ctx.lineTo(ax2, ay1); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax2 - 6, ay1 + (upw ? 7 : -7)); ctx.lineTo(ax2, ay1); ctx.lineTo(ax2 + 6, ay1 + (upw ? 7 : -7)); ctx.stroke();
      var wl = upw ? 'gas does work' : 'work done on gas'; ctx.font = '700 10.5px system-ui,sans-serif'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(6,17,26,.75)'; ctx.fillRect(x0 + 4, py + 13, ctx.measureText(wl).width + 6, 15); ctx.fillStyle = C.green; ctx.fillText(wl, x0 + 7, py + 24);
    }
  }
  function gasColor(T) { return clamp(38 + (T - 300) / 15, 0, 100); }
  function drawPV() {
    var r = R.pv; ctx.fillStyle = 'rgba(11,27,39,.82)'; ctx.strokeStyle = C.line; rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.stroke();
    var x0 = r.x + 44, x1 = r.x + r.w - 12, y0 = r.y + r.h - 24, y1 = r.y + 22, Vm = 5.2, Pm = S.pScale;
    function X(V) { return lerp(x0, x1, V / Vm); } function Y(P) { return lerp(y0, y1, P / Pm); }
    ctx.font = '700 11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText('P–V DIAGRAM', r.x + 10, r.y + 15);
    // grid and ticks
    ctx.font = '10px ui-monospace,Menlo,Consolas,monospace';
    var pStep = Pm <= 300 ? 50 : Pm <= 600 ? 100 : Pm <= 1500 ? 250 : Pm <= 3000 ? 500 : 1000;
    for (var p = 0; p <= Pm + 1e-6; p += pStep) { var y = Y(p); ctx.strokeStyle = 'rgba(120,170,200,.12)'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText(p + '', x0 - 4, y + 3); }
    for (var v = 0; v <= 5; v += 1) { var x = X(v); ctx.strokeStyle = 'rgba(120,170,200,.12)'; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.fillStyle = C.muted; ctx.textAlign = 'center'; ctx.fillText(v + '', x, y0 + 13); }
    ctx.textAlign = 'right'; ctx.fillText('V, liters', x1, y0 + 22 > r.y + r.h - 2 ? y0 - 4 : y0 + 22);
    ctx.save(); ctx.translate(r.x + 11, (y0 + y1) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.fillText('P, kPa', 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y1, x1 - x0, y0 - y1); ctx.clip();
    // faint isotherms
    [100, 200, 300, 450, 600, 900, 1200, 1800].forEach(function (Tk) {
      ctx.strokeStyle = tcol(gasColor(Tk), 0.16); ctx.lineWidth = 1; ctx.beginPath();
      for (var k = 0; k <= 60; k++) { var VV = 0.3 + k / 60 * 4.9, PP = gas.n * F.R * Tk / (VV / 1000) / 1000, xx = X(VV), yy = Y(PP); if (k) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke();
    });
    // the current isotherm
    ctx.strokeStyle = 'rgba(255,212,121,.7)'; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.3; ctx.beginPath();
    for (var k2 = 0; k2 <= 80; k2++) { var V2 = 0.3 + k2 / 80 * 4.9, P2 = gas.n * F.R * gas.T / (V2 / 1000) / 1000, xx2 = X(V2), yy2 = Y(P2); if (k2) ctx.lineTo(xx2, yy2); else ctx.moveTo(xx2, yy2); }
    ctx.stroke(); ctx.setLineDash([]);
    // loops
    S.loops.forEach(function (L) {
      var age = S.t - L.born, a = clamp(1 - age / 40, 0.25, 1);
      ctx.fillStyle = L.area > 0 ? 'rgba(255,212,121,' + 0.28 * a + ')' : 'rgba(116,192,252,' + 0.25 * a + ')'; ctx.beginPath();
      L.pts.forEach(function (q, i) { if (i) ctx.lineTo(X(q[0]), Y(q[1])); else ctx.moveTo(X(q[0]), Y(q[1])); }); ctx.closePath(); ctx.fill();
    });
    // work under the current run
    var path = S.path, n = path.length, i;
    if (n - S.runFrom > 2) {
      var Wrun = path[n - 1].w - path[S.runFrom].w;
      if (Math.abs(Wrun) > 1) {
        ctx.fillStyle = Wrun > 0 ? 'rgba(99,230,190,.16)' : 'rgba(99,230,190,.10)'; ctx.beginPath(); ctx.moveTo(X(path[S.runFrom].V), Y(0));
        for (i = S.runFrom; i < n; i++) ctx.lineTo(X(path[i].V), Y(path[i].P)); ctx.lineTo(X(path[n - 1].V), Y(0)); ctx.closePath(); ctx.fill();
      }
    }
    // the path
    ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    for (i = 1; i < n; i++) { var a2 = path[i - 1], b2 = path[i]; ctx.strokeStyle = b2.kind > 0 ? C.red : b2.kind < 0 ? C.blue : C.green; ctx.beginPath(); ctx.moveTo(X(a2.V), Y(a2.P)); ctx.lineTo(X(b2.V), Y(b2.P)); ctx.stroke(); }
    ctx.restore();
    // labels
    S.loops.forEach(function (L) {
      if (S.t - L.born > 40) return; var cxs = 0, cys = 0; L.pts.forEach(function (q) { cxs += q[0]; cys += q[1]; });
      ctx.font = '700 11px system-ui,sans-serif'; ctx.fillStyle = L.area > 0 ? C.gold : C.blue; ctx.textAlign = 'center'; ctx.fillText('W net = ' + J(L.W), X(cxs / L.pts.length), Y(cys / L.pts.length));
    });
    var cx = X(gas.V * 1000), cy = Y(gas.P() / 1000);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill();
    ctx.font = '600 10.5px system-ui,sans-serif'; ctx.fillStyle = C.gold; ctx.textAlign = 'right'; ctx.fillText('isotherm, ' + fmt(gas.T, 0) + ' K', x1 - 4, y1 + 12);
    if (n - S.runFrom > 2) { var Wr = path[n - 1].w - path[S.runFrom].w; if (Math.abs(Wr) > 1) { ctx.fillStyle = C.green; ctx.textAlign = 'left'; ctx.fillText('shaded area = work = ' + J(Wr), x0 + 6, y1 + 12); } }
    // key
    if (r.w > 300) {
      ctx.font = '600 10px system-ui,sans-serif'; ctx.textAlign = 'left'; var kx = r.x + 100;
      [[C.red, 'heat in'], [C.blue, 'heat out'], [C.green, 'no heat']].forEach(function (it) { ctx.fillStyle = it[0]; ctx.fillRect(kx, r.y + 9, 12, 3); ctx.fillText(it[1], kx + 15, r.y + 14); kx += ctx.measureText(it[1]).width + 30; });
    }
  }
  function drawBars() {
    var r = R.bars; ctx.fillStyle = 'rgba(11,27,39,.82)'; ctx.strokeStyle = C.line; rr(ctx, r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.stroke();
    ctx.font = '700 11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText(R.wide ? 'ENERGY SINCE THE METERS WERE ZEROED' : 'ENERGY', r.x + 10, r.y + 15);
    var Q = gas.Q, W = gas.W, dU = gas.dU(), maxE = Math.max(40, Math.abs(Q), Math.abs(W), Math.abs(dU));
    var eqH = R.wide ? 34 : 46, top = r.y + 26, bot = r.y + r.h - eqH - 18, mid = (top + bot) / 2, half = (bot - top) / 2 - 15;
    var items = [['Q', 'heat in', Q, Q >= 0 ? C.red : C.blue], ['W', 'work by gas', W, C.green], ['ΔU', 'internal energy', dU, C.gold]];
    var colW = (r.w - 20) / 3;
    ctx.strokeStyle = 'rgba(220,240,255,.35)'; ctx.beginPath(); ctx.moveTo(r.x + 10, mid); ctx.lineTo(r.x + r.w - 10, mid); ctx.stroke();
    items.forEach(function (it, i) {
      var cx = r.x + 10 + colW * (i + 0.5), bw = Math.min(42, colW * 0.42), hgt = it[2] / maxE * half;
      ctx.save(); if (!reduced) { ctx.shadowColor = it[3]; ctx.shadowBlur = 10; } ctx.fillStyle = it[3]; ctx.fillRect(cx - bw / 2, Math.min(mid, mid - hgt), bw, Math.max(1, Math.abs(hgt))); ctx.restore();
      ctx.textAlign = 'center'; ctx.font = '700 13px "Cambria Math",Georgia,serif'; ctx.fillStyle = it[3];
      var ly = hgt >= 0 ? mid + 15 : mid - 7; ctx.fillText(it[0], cx, ly);
      ctx.font = '600 ' + (R.wide ? 11 : 10) + 'px ui-monospace,Menlo,Consolas,monospace'; ctx.fillStyle = C.ink;
      var vy = hgt >= 0 ? mid - hgt - 5 : mid - hgt + 13; ctx.fillText(R.wide ? J(it[2]) : fmt(it[2], 0), cx, clamp(vy, top + 10, bot));
      if (R.wide || r.w > 200) { ctx.font = '10px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.fillText(it[1], cx, bot + 14); }
    });
    // the equation
    var ey = r.y + r.h - eqH + 6;
    ctx.textAlign = 'center'; ctx.font = '700 ' + (R.wide ? 13 : 12) + 'px "Cambria Math",Georgia,serif'; ctx.fillStyle = C.ink;
    var dd = R.wide ? 1 : 0, s1 = 'Q − W = ΔU', s2 = fmt(Q, dd) + ' − ' + (W < 0 ? '(' + fmt(W, dd) + ')' : fmt(W, dd)) + ' = ' + fmt(dU, dd) + ' J ✓';
    if (R.wide) ctx.fillText(s1 + ':   ' + s2, r.x + r.w / 2, ey + 8);
    else { ctx.fillText(s1, r.x + r.w / 2, ey); ctx.font = '600 10.5px ui-monospace,Menlo,Consolas,monospace'; ctx.fillStyle = C.green; ctx.fillText(s2, r.x + r.w / 2, ey + 16); }
  }

  loadPreset(ui.get('pre', 'adiabatic'));
  layout();
  LAB.loop(frame, view);

  // ======================================================================= Joule's paddle wheel
  (function joule() {
    var jv = $('th2-joule-view'), jcv = $('th2-joule-cv'); if (!jcv) return;
    var JK = LAB.canvas(jcv), g = JK.c, jhud = $('th2-joule-hud');
    var inM = $('th2-jm'), inH = $('th2-jh'), inW = $('th2-jw');
    var st = { M: 10, h: 1.5, mw: 1, drops: 0, work: 0, dT: 0, queue: 0, phase: 0, f: 0, angle: 0, clock: 0 };
    var JM = LAB.missions($('th2-jmissions'), 'thermo-first-joule', [
      { id: 'one', title: 'One degree', goal: 'Warm the water by 1.00 °C, give or take 0.03 °C. Choose the weights, height and water wisely.' },
      { id: 'cal', title: 'One food Calorie', goal: 'Do 4184 J of work (one food Calorie), within 2%.' }
    ]);
    function syncOut() { $('th2-jm-o').textContent = st.M + ' kg'; $('th2-jh-o').textContent = fmt(st.h, 1) + ' m'; $('th2-jw-o').textContent = fmt(st.mw, 1) + ' kg'; }
    function fresh() { st.drops = 0; st.work = 0; st.dT = 0; st.queue = 0; st.phase = 0; st.f = 0; upd(); }
    inM.addEventListener('input', function () { st.M = +inM.value; syncOut(); upd(); });
    inH.addEventListener('input', function () { st.h = +inH.value; syncOut(); upd(); });
    inW.addEventListener('input', function () { st.mw = +inW.value; syncOut(); fresh(); });
    $('th2-jdrop').addEventListener('click', function () { st.queue += 1; });
    $('th2-jdrop10').addEventListener('click', function () { st.queue += 10; });
    $('th2-jreset').addEventListener('click', fresh);
    jcv.addEventListener('keydown', function (e) { if (e.key === ' ') { st.queue += 1; e.preventDefault(); } });
    function upd() {
      $('th2-jd').textContent = st.drops; $('th2-jwk').textContent = fmt(st.work, 0) + ' J';
      $('th2-jdt').textContent = '+' + fmt(st.dT, 3) + ' °C'; $('th2-jcal').textContent = fmt(st.work / 4.184, 0) + ' cal';
      var need = F.jouleHeight(st.M, st.mw, 1); $('th2-jneed').textContent = fmt(need, 1) + ' m = ' + Math.ceil(need / st.h - 1e-9) + ' drops';
      jhud.innerHTML = 'Each drop: <b>' + fmt(2 * st.M * F.G0 * st.h, 0) + ' J</b> → +' + fmt(F.jouleRise(st.M, st.h, st.mw), 4) + ' °C';
    }
    function finishDrop() {
      st.drops++;
      if (Math.abs(st.dT - 1) <= 0.03 && JM.done('one')) LAB.toast(jv, '✓ One degree: ' + st.drops + ' drops, ' + fmt(st.work, 0) + ' J for ' + fmt(st.mw, 1) + ' kg of water.');
      if (Math.abs(st.work / 4184 - 1) <= 0.02 && JM.done('cal')) LAB.toast(jv, '✓ One food Calorie: ' + fmt(st.work, 0) + ' J of falling weight, now heat in the water.');
    }
    syncOut(); upd();
    var FALL = 2.2, WIND = 0.7;
    LAB.loop(function (dt) {
      // phases: 0 idle, 1 falling, 2 winding back up
      if (st.phase === 0 && st.queue > 0) { st.queue--; st.phase = 1; st.f = 0; }
      if (st.phase === 1) {
        var df = reduced ? 1 : Math.min(1 - st.f, dt / (st.queue > 3 ? FALL / 4 : FALL)), dW = 2 * st.M * F.G0 * st.h * df;
        st.f += df; st.work += dW; st.dT += dW / (st.mw * F.C_WATER); st.angle += df * st.h * 9;
        if (st.f >= 1 - 1e-9) { st.f = 1; st.phase = 2; finishDrop(); }
      } else if (st.phase === 2) { st.f -= reduced ? 1 : dt / (st.queue > 3 ? WIND / 4 : WIND); if (st.f <= 0) { st.f = 0; st.phase = 0; } }
      st.clock -= dt; if (st.clock <= 0) { st.clock = 0.1; upd(); }
      drawJ();
    }, jv);
    function drawJ() {
      var w = JK.w, h = JK.h; g.clearRect(0, 0, w, h);
      var floor = h - 22, cx = w / 2, tw = Math.min(w * 0.36, 230), th = Math.min(h * 0.42, 190), tx = cx - tw / 2, ty = floor - th - 30;
      var pulleyY = Math.max(56, ty - 60), pl = Math.max(30, tx - Math.min(110, w * 0.17)), pr = Math.min(w - 30, tx + tw + Math.min(110, w * 0.17));
      // floor
      g.strokeStyle = 'rgba(160,200,225,.45)'; g.beginPath(); g.moveTo(10, floor); g.lineTo(w - 10, floor); g.stroke();
      // stand and tank
      g.fillStyle = '#3a2b20'; g.fillRect(tx + 10, ty + th, 10, floor - ty - th); g.fillRect(tx + tw - 20, ty + th, 10, floor - ty - th);
      var wc = 'rgba(' + Math.round(40 + st.dT * 40) + ',' + 110 + ',' + Math.round(200 - st.dT * 30) + ',.55)';
      rr(g, tx, ty, tw, th, 14); g.fillStyle = '#6b4a2e'; g.fill();
      rr(g, tx + 8, ty + 8, tw - 16, th - 16, 10); g.fillStyle = wc; g.fill();
      g.strokeStyle = 'rgba(40,25,15,.6)'; g.lineWidth = 1; for (var s = 1; s < 6; s++) { g.beginPath(); g.moveTo(tx + tw * s / 6, ty); g.lineTo(tx + tw * s / 6, ty + 8); g.moveTo(tx + tw * s / 6, ty + th - 8); g.lineTo(tx + tw * s / 6, ty + th); g.stroke(); }
      // paddles: vanes on a vertical axle, turning
      var ax = cx, a0 = ty - 40, a1 = ty + th - 18;
      g.fillStyle = '#c4d3de'; g.fillRect(ax - 3, a0, 6, a1 - a0);
      for (var lvl = 0; lvl < 3; lvl++) {
        var vy = ty + 28 + lvl * (th - 50) / 2.4;
        for (var k = 0; k < 4; k++) {
          var ang = st.angle + k * Math.PI / 2 + lvl * 0.4, cs = Math.cos(ang), sn = Math.sin(ang), len = tw * 0.3;
          g.fillStyle = sn > 0 ? 'rgba(220,232,240,.95)' : 'rgba(150,170,185,.75)';
          g.fillRect(ax + Math.min(0, cs * len), vy - 7, Math.abs(cs * len) + 1, 14);
        }
      }
      // swirl in the water
      if (!reduced && st.phase === 1) { g.strokeStyle = 'rgba(255,255,255,.35)'; for (var sw = 0; sw < 6; sw++) { var sx = tx + 20 + ((st.angle * 12 + sw * 37) % (tw - 40)), sy = ty + 24 + sw * (th - 48) / 6; g.beginPath(); g.arc(sx, sy, 6, 0, 4); g.stroke(); } }
      // drum, cords, pulleys, weights
      var drumY = a0 + 6; g.fillStyle = '#9fb2c1'; g.fillRect(ax - 16, drumY - 8, 32, 16);
      var fallPx = Math.min(floor - pulleyY - 80, 30 + st.h * 60), wy = pulleyY + 26 + st.f * fallPx, wsz = 26 + Math.sqrt(st.M) * 5;
      g.strokeStyle = 'rgba(230,220,200,.85)'; g.lineWidth = 1.5;
      [pl, pr].forEach(function (px, side) {
        g.beginPath(); g.moveTo(ax + (side ? 16 : -16), drumY); g.lineTo(px, pulleyY - 10); g.lineTo(px + (side ? 10 : -10), pulleyY); g.lineTo(px + (side ? 10 : -10), wy); g.stroke();
        g.fillStyle = '#3a2b20'; g.fillRect(px - 3, pulleyY, 6, floor - pulleyY);
        g.beginPath(); g.arc(px, pulleyY, 11, 0, 7); g.fillStyle = '#c4d3de'; g.fill(); g.strokeStyle = '#7d909e'; g.stroke();
        g.save(); g.translate(px, pulleyY); g.rotate((side ? -1 : 1) * st.angle * 2); g.strokeStyle = '#5b6a77'; g.beginPath(); g.moveTo(-9, 0); g.lineTo(9, 0); g.moveTo(0, -9); g.lineTo(0, 9); g.stroke(); g.restore();
        var wx = px + (side ? 10 : -10) - wsz / 2; rr(g, wx, wy, wsz, wsz * 1.1, 4); g.fillStyle = '#6c7c8a'; g.fill(); g.strokeStyle = '#a9bccb'; g.stroke();
        g.fillStyle = '#e6eef4'; g.font = '700 10px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText(st.M + ' kg', wx + wsz / 2, wy + wsz * 0.62);
        g.strokeStyle = 'rgba(255,212,121,.6)'; g.setLineDash([3, 3]); g.lineWidth = 1; g.beginPath(); g.moveTo(px + (side ? 10 : -10) + (side ? wsz / 2 + 6 : -wsz / 2 - 6), pulleyY + 26); g.lineTo(px + (side ? 10 : -10) + (side ? wsz / 2 + 6 : -wsz / 2 - 6), pulleyY + 26 + fallPx); g.stroke(); g.setLineDash([]);
        if (!side) { g.fillStyle = C.gold; g.font = '600 10.5px system-ui,sans-serif'; var hl = 'h = ' + fmt(st.h, 1) + ' m', hx = px - 10 - wsz / 2 - 10;
          if (hx - g.measureText(hl).width < 4) { g.textAlign = 'left'; g.fillText(hl, 4, pulleyY + 26 + fallPx + 16); } else { g.textAlign = 'right'; g.fillText(hl, hx, pulleyY + 30 + fallPx / 2); } }
      });
      // thermometer in the tank
      var thx = tx + tw - 30, thy0 = ty - 26, thy1 = ty + th - 22;
      g.fillStyle = 'rgba(230,245,255,.18)'; g.strokeStyle = 'rgba(230,245,255,.7)'; rr(g, thx - 5, thy0, 10, thy1 - thy0, 5); g.fill(); g.stroke();
      var frac = clamp(0.25 + st.dT / 4, 0.25, 1), ly = lerp(thy1 - 4, thy0 + 6, frac); g.fillStyle = C.red; g.fillRect(thx - 2, ly, 4, thy1 - ly); g.beginPath(); g.arc(thx, thy1, 7, 0, 7); g.fill();
      g.font = '700 ' + (w < 500 ? 15 : 19) + 'px ui-monospace,Menlo,Consolas,monospace'; g.fillStyle = C.gold; g.textAlign = w < 500 ? 'center' : 'right';
      g.fillText('ΔT = +' + fmt(st.dT, 3) + ' °C', w < 500 ? cx : w - 16, w < 500 ? 62 : 30);
      g.font = '600 11px system-ui,sans-serif'; g.fillStyle = C.ink; g.fillText(fmt(st.mw, 1) + ' kg of water, insulated', cx, ty + th + 16);
    }
  })();

  // ======================================================================= food Calories
  (function cal() {
    var inp = $('th2-cal-in'), out = $('th2-cal-out'), o = $('th2-cal-o'); if (!inp) return;
    function upd() {
      var kc = +inp.value, E = kc * 4184; o.textContent = kc + ' Calories';
      out.innerHTML = '<li><b>' + Math.round(E).toLocaleString('en-US') + ' J</b>' + kc + ' × 4184 J: about ' + fmt(E / 1e6, 2) + ' megajoules.</li>' +
        '<li><b>' + fmt(E / (50 * F.G0) / 1000, 2) + ' km</b>the height it could lift a 50 kg person, if every joule went into lifting.</li>' +
        '<li><b>' + fmt(E / (4186 * 10), 1) + ' kg</b>of water it could warm by 10 °C.</li>' +
        '<li><b>' + fmt(E / 10 / 3600, 1) + ' hours</b>of running a 10-watt LED bulb.</li>';
    }
    inp.addEventListener('input', upd); upd();
  })();

  // ======================================================================= where the energy goes in a car
  (function flow() {
    var fv = $('th2-flow-view'), fcv = $('th2-flow-cv'), info = $('th2-flow-info'); if (!fcv) return;
    var FK = LAB.canvas(fcv), g = FK.c;
    var B = [
      { k: 'engine', name: 'Engine losses', p: 69, range: '68–72%', col: C.red, text: 'Engine losses, 68–72%: most of the fuel’s energy leaves as heat, out the exhaust pipe and through the radiator, plus energy spent pumping air in and out and on friction inside the engine. No heat engine can avoid dumping heat; Chapter 4 shows why.' },
      { k: 'para', name: 'Accessories', p: 5, range: '4–6%', col: C.pink, text: 'Parasitic losses, 4–6%: energy taken from the engine to run the car’s accessories.' },
      { k: 'drive', name: 'Drivetrain', p: 5, range: '5–6%', col: '#b8a6ff', text: 'Drivetrain losses, 5–6%: friction in the transmission and the rest of the drivetrain between the engine and the wheels.' },
      { k: 'idle', name: 'Idling', p: 3, range: '3%', col: C.blue, text: 'Idle losses, 3%: fuel burned while the car sits still with the engine running, at lights and in traffic. On the highway this is zero.' },
      { k: 'aux', name: 'Auxiliary', p: 1, range: '0–2%', col: '#9fb2c1', text: 'Auxiliary engine losses, 0–2%, as listed by the Department of Energy.' },
      { k: 'wheels', name: 'To the wheels', p: 17, range: '16–25%', col: C.green, text: 'Power to the wheels, 16–25%: the energy that moves the car. It goes into pushing air aside, flexing the tires and speeding up, and the brakes turn the speed back into heat. On a trip that starts and ends parked, even this ends up as heat.' }
    ];
    var sel = 5, packets = [], tally = new Float64Array(B.length), total = 0, spawnAcc = 0;
    function pick() { var r = Math.random() * 100, a = 0; for (var i = 0; i < B.length; i++) { a += B[i].p; if (r < a) return i; } return B.length - 1; }
    function setSel(i) { sel = (i + B.length) % B.length; info.textContent = B[sel].text; }
    setSel(5);
    var L = {};
    function lay() {
      var w = FK.w, h = FK.h; L.w = w; L.h = h; L.narrow = w < 560;
      L.fx = 16; L.fw = L.narrow ? 14 : 18; L.top = 36; L.bot = h - 18; L.H = L.bot - L.top;
      L.bx = L.narrow ? w * 0.40 : w * 0.46; L.bw = 12; L.hx = w - (L.narrow ? 26 : 34); L.hw = L.narrow ? 14 : 20;
      var gap = L.narrow ? 12 : 16, avail = L.H * 0.86 - gap * (B.length - 1), y = L.top + L.H * 0.07;
      B.forEach(function (b) { b.h = Math.max(10, avail * b.p / 100); });
      var sum = B.reduce(function (s, b) { return s + b.h; }, 0), k = avail / sum;
      B.forEach(function (b, i) { b.h *= k; b.y = y; y += b.h + gap; b.fy = L.top + L.H * B.slice(0, i).reduce(function (s, q) { return s + q.p; }, 0) / 100; b.fh = L.H * b.p / 100; });
    }
    function band(x0, y0, h0, x1, y1, h1, col, a) {
      var mx = (x0 + x1) / 2; g.fillStyle = col; g.globalAlpha = a; g.beginPath(); g.moveTo(x0, y0); g.bezierCurveTo(mx, y0, mx, y1, x1, y1); g.lineTo(x1, y1 + h1); g.bezierCurveTo(mx, y1 + h1, mx, y0 + h0, x0, y0 + h0); g.closePath(); g.fill(); g.globalAlpha = 1;
    }
    function bez(x0, y0, x1, y1, t) { var mx = (x0 + x1) / 2, u = 1 - t; return { x: u * u * u * x0 + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * x1, y: u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1 }; }
    fcv.addEventListener('click', function (e) { var r = fcv.getBoundingClientRect(), y = e.clientY - r.top, x = e.clientX - r.left; for (var i = 0; i < B.length; i++) if (y >= B[i].y - 5 && y <= B[i].y + B[i].h + 5 && x > L.fx + L.fw) { setSel(i); return; } });
    fcv.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { setSel(sel + 1); e.preventDefault(); } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { setSel(sel - 1); e.preventDefault(); } });
    LAB.loop(function (dt) {
      if (FK.w !== L.w || FK.h !== L.h) lay();
      var w = FK.w, h = FK.h; g.clearRect(0, 0, w, h);
      // bands: fuel → branch → heat
      B.forEach(function (b, i) {
        var hi = i === sel;
        band(L.fx + L.fw, b.fy, b.fh, L.bx, b.y, b.h, b.col, hi ? 0.45 : 0.2);
        var hy = L.top + (b.fy - L.top);
        band(L.bx + L.bw, b.y, b.h, L.hx, hy, b.fh, i === 5 ? C.green : C.red, hi ? 0.32 : 0.1);
      });
      // nodes
      var fg = g.createLinearGradient(0, L.top, 0, L.bot); fg.addColorStop(0, C.gold); fg.addColorStop(1, '#e8a33d');
      g.fillStyle = fg; g.fillRect(L.fx, L.top, L.fw, L.H);
      var hg = g.createLinearGradient(0, L.top, 0, L.bot); hg.addColorStop(0, C.red); hg.addColorStop(1, '#c94b4b');
      g.fillStyle = hg; g.fillRect(L.hx, L.top, L.hw, L.H);
      B.forEach(function (b, i) { g.fillStyle = b.col; g.fillRect(L.bx, b.y, L.bw, b.h); if (i === sel) { g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(L.bx - 2, b.y - 2, L.bw + 4, b.h + 4); } });
      // packets
      if (!reduced) {
        spawnAcc += dt * 40; while (spawnAcc >= 1) { spawnAcc -= 1; var bi = pick(); packets.push({ b: bi, t: 0, o: Math.random(), st: 0 }); }
        for (var i = packets.length - 1; i >= 0; i--) {
          var p = packets[i], b = B[p.b]; p.t += dt * 0.55;
          if (p.st === 0 && p.t >= 1) { p.st = 1; p.t = 0; tally[p.b]++; total++; }
          if (p.st === 1 && p.t >= 1) { packets.splice(i, 1); continue; }
          var q = p.st === 0 ? bez(L.fx + L.fw, b.fy + p.o * b.fh, L.bx, b.y + p.o * b.h, p.t) : bez(L.bx + L.bw, b.y + p.o * b.h, L.hx, b.fy + p.o * b.fh, p.t);
          var col = p.st === 0 ? (p.t < 0.3 ? C.gold : b.col) : (p.b === 5 && p.t < 0.5 ? C.green : C.red);
          g.fillStyle = col; g.globalAlpha = 0.25; g.beginPath(); g.arc(q.x, q.y, 6, 0, 7); g.fill(); g.globalAlpha = 0.95; g.beginPath(); g.arc(q.x, q.y, p.b === sel ? 3.2 : 2.5, 0, 7); g.fill(); g.globalAlpha = 1;
        }
      }
      // labels
      g.textAlign = 'left'; g.textBaseline = 'middle';
      B.forEach(function (b, i) {
        var y = b.y + b.h / 2, x = L.bx + L.bw + 8, pct = total > 50 ? fmt(tally[i] / total * 100, 0) + '%' : b.p + '%';
        g.font = (i === sel ? '700 ' : '600 ') + (L.narrow ? 11 : 12.5) + 'px system-ui,sans-serif'; g.fillStyle = i === sel ? '#fff' : C.ink;
        var tx = b.name + ' ' + b.range; g.fillStyle = 'rgba(6,17,26,.75)'; var tw = g.measureText(tx).width; g.fillRect(x - 3, y - 9, tw + 6, 18);
        g.fillStyle = i === sel ? '#fff' : b.col; g.fillText(tx, x, y);
        if (!L.narrow) { g.font = '10.5px ui-monospace,Menlo,Consolas,monospace'; g.fillStyle = C.muted; g.fillText('packets: ' + pct, x + tw + 10, y); }
      });
      g.textBaseline = 'alphabetic'; g.font = '700 11px system-ui,sans-serif'; g.fillStyle = C.gold; g.textAlign = 'left'; g.fillText('FUEL 100%', L.fx, 22);
      g.fillStyle = C.red; g.textAlign = 'right'; g.fillText(L.narrow ? 'ALL HEAT' : 'IN THE END: ALL HEAT, 100%', w - 10, 22);
    }, fv);
  })();
})();
