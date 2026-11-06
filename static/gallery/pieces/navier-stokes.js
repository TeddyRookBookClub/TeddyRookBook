/* Math Gallery: Navier-Stokes. Four scenes behind a switch:
   "Wing": our lattice Boltzmann solver (D2Q9, BGK: incompressible Navier-Stokes at low Mach). NACA 4-digit wing,
     bounce-back walls, forces by momentum exchange; semi-Lagrangian smoke; grid adapts to the device.
   "Euler's disk": Moffatt's model (Nature 404, 833, 2000) of a disk settling on a table. Tilt a = a0 (1 - t/t0)^(1/3),
     contact point rate W^2 = 4g/(R sin a); the air film under the disk by lubrication theory (Reynolds equation,
     solved once in the frame turning with the contact point); a graph; a Web Audio whirr at 8 x W/2pi, started only
     by a tap, ducking the background music with the window event 'trb:sound-start'.
   "Shapes, cars & animals": the same kind of solver (shared code: Flow, below) around our own generic drawings of
     shapes, cars (eras and classes, no real makes), animals and buildings; a still or rolling floor; a live force chart.
   "Shape Lab": five challenges scored by fixed-length, averaged trials; bests in localStorage. The body editor drags
     control points with RuleDrag (static/js/rule-drag.js, loaded on demand), keeping the area fixed. */
(function () {
'use strict';
/* The wing: air past a NACA 4-digit wing section. */
function wingScene(g, statsBox) {
  var K = Math;
  var c = g.canvas({ aspect: 0.5, max: 440, min: 210, label: 'Air flows left to right past a wing. Colors show pressure; smoke streaks show the paths the air takes.' });
  var U = 0.1, EX = new Int8Array([0, 1, 0, -1, 0, 1, -1, -1, 1]), EY = new Int8Array([0, 0, 1, 0, -1, 1, 1, -1, -1]), OP = [0, 3, 4, 1, 2, 7, 8, 5, 6],
    OF = new Int32Array(9), HB = new Float64Array(9), WT = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
  var P = { a: 5, m: 4, t: 12, re: 300, flip: false, view: 'p', smoke: true };
  var nx, ny, N, f, f2, rho, ux, uy, sm, sm2, solid, ch, px, py, tau, reEff, spf = 4, Fx = 0, Fy = 0, img, oc, lut;
  function eq(k, r, vx, vy) {
    var uu = 1.5 * (vx * vx + vy * vy);
    for (var i = 0; i < 9; i++) { var cu = 3 * (EX[i] * vx + EY[i] * vy); f[i * N + k] = WT[i] * r * (1 + cu + 0.5 * cu * cu - uu); }
  }
  function camber(s) { var m = P.m / 100, p = 0.4; return s < p ? m / (p * p) * (2 * p * s - s * s) : m / ((1 - p) * (1 - p)) * (1 - 2 * p + 2 * p * s - s * s); }
  function half(s) { return 5 * P.t / 100 * (0.2969 * K.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s * s * s - 0.1036 * s * s * s * s); }
  function toWing(X, Y) {
    var a = P.a * K.PI / 180, x = X, y = P.flip ? Y : -Y, u = x * K.cos(a) - y * K.sin(a), v = x * K.sin(a) + y * K.cos(a);
    return [u / ch + 0.25, v / ch];
  }
  function toScreen(s, v) {
    var a = P.a * K.PI / 180, u = (s - 0.25) * ch; v *= ch;
    return [px + u * K.cos(a) + v * K.sin(a), py + (P.flip ? -1 : 1) * (u * K.sin(a) - v * K.cos(a))];
  }
  function mask() {
    var was = solid; solid = new Uint8Array(N);
    for (var j = 0; j < ny; j++) for (var i = 0; i < nx; i++) {
      var w = toWing(i + 0.5 - px, j + 0.5 - py), s = w[0], k = j * nx + i;
      if (s >= 0 && s <= 1 && K.abs(w[1] - camber(s)) <= half(s) + 0.4 / ch) solid[k] = 1;
      if (was && was[k] && !solid[k]) { eq(k, 1, 0, 0); sm[k] = 0; }
    }
  }
  function setRe() { tau = K.max(0.512, 3 * U * ch / P.re + 0.5); reEff = U * ch / ((tau - 0.5) / 3); }
  function A(n) { return new Float32Array(n); }
  function init() {
    nx = K.max(100, K.min(240, K.round(c.w / 3.4))); ny = K.round(nx * c.h / c.w); N = nx * ny;
    f = A(9 * N); f2 = A(9 * N); rho = A(N); ux = A(N); uy = A(N); sm = A(N); sm2 = A(N); solid = null;
    ch = K.round(nx * 0.24); px = nx * 0.3; py = ny * 0.5;
    for (var k = 0; k < N; k++) { eq(k, 1, U, 0); rho[k] = 1; ux[k] = U; }
    mask(); setRe(); Fx = Fy = 0;
    oc = document.createElement('canvas'); oc.width = nx; oc.height = ny; img = oc.getContext('2d').createImageData(nx, ny);
  }
  function step() { // pull from upwind (bounce back off the wing), relax
    var om = 1 / tau, k, i, fx = 0, fy = 0, h = HB, x, j;
    for (i = 0; i < 9; i++) OF[i] = EX[i] + EY[i] * nx;
    for (j = 1; j < ny - 1; j++) for (x = 1, k = j * nx + 1; x < nx - 1; x++, k++) {
      if (solid[k]) continue;
      var r = 0, vx = 0, vy = 0;
      for (i = 0; i < 9; i++) {
        var src = k - OF[i], v;
        if (solid[src]) { v = f[OP[i] * N + k]; fx -= 2 * v * EX[i]; fy -= 2 * v * EY[i]; } else v = f[i * N + src];
        h[i] = v; r += v; vx += v * EX[i]; vy += v * EY[i];
      }
      vx /= r; vy /= r; rho[k] = r; ux[k] = vx; uy[k] = vy;
      var uu = 1.5 * (vx * vx + vy * vy);
      for (i = 0; i < 9; i++) { var cu = 3 * (EX[i] * vx + EY[i] * vy); f2[i * N + k] = h[i] + om * (WT[i] * r * (1 + cu + 0.5 * cu * cu - uu) - h[i]); }
    }
    var tmp = f; f = f2; f2 = tmp;
    for (j = 0; j < ny; j++) { eq(j * nx, 1, U, 0); for (i = 0; i < 9; i++) f[i * N + j * nx + nx - 1] = f[i * N + j * nx + nx - 2]; }
    for (x = 0; x < nx; x++) { eq(x, 1, U, 0); eq(N - nx + x, 1, U, 0); }
    Fx += (fx - Fx) * 0.02; Fy += (fy - Fy) * 0.02;
    for (j = 1; j < ny - 1; j++) for (x = 1; x < nx - 1; x++) {
      k = j * nx + x; if (solid[k]) { sm2[k] = 0; continue; }
      var sx = K.max(0, K.min(nx - 1.01, x - ux[k])), sy = K.max(0, K.min(ny - 1.01, j - uy[k])), i0 = sx | 0, j0 = sy | 0, a = sx - i0, b = sy - j0, q0 = j0 * nx + i0;
      sm2[k] = 0.9995 * ((1 - b) * ((1 - a) * sm[q0] + a * sm[q0 + 1]) + b * ((1 - a) * sm[q0 + nx] + a * sm[q0 + nx + 1]));
    }
    tmp = sm; sm = sm2; sm2 = tmp;
    var gap = K.max(6, K.round(ny / 11));
    for (j = 0; j < ny; j++) sm[j * nx] = sm[j * nx + 1] = j % gap ? 0 : 1;
  }
  function coef() { var d = 0.5 * U * U * ch; return { cl: -Fy / d, cd: Fx / d }; }
  function sane() { var r = rho[(py | 0) * nx + 2]; return r === r && K.abs(r - 1) < 0.5; }
  function rebuildLut(col) {
    var ends = { p: [col.blue, col.red], s: [col.orange, col.teal], w: [col.purple, col.gold] }[P.view], bg = hex(col.bg), A = hex(ends[0]), B = hex(ends[1]);
    lut = new Uint8ClampedArray(256 * 3);
    for (var n = 0; n < 256; n++) { var t = n / 127.5 - 1, e = t < 0 ? A : B, w = K.min(1, K.pow(K.abs(t), 0.8)); for (var q = 0; q < 3; q++) lut[n * 3 + q] = bg[q] + (e[q] - bg[q]) * w; }
  }
  function hex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  var lutKey = '';
  g.draw(function (col) {
    var kk = P.view + col.bg; if (kk !== lutKey) { rebuildLut(col); lutKey = kk; }
    var d = img.data, ink = hex(col.ink), k, cp = 1 / (1.5 * U * U), j, i;
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      k = j * nx + i; var o = k * 4, v = 0;
      if (P.view === 'p') v = (rho[k] - rho[2 * nx + i]) * cp;
      else if (P.view === 's') v = (K.sqrt(ux[k] * ux[k] + uy[k] * uy[k]) / U - 1) * 1.6;
      else if (i > 0 && j > 0 && i < nx - 1 && j < ny - 1) v = ((uy[k + 1] - uy[k - 1]) - (ux[k + nx] - ux[k - nx])) / U * 2;
      var n = K.max(0, K.min(255, (v + 1) * 127.5 | 0)) * 3, s = P.smoke ? K.min(1, sm[k] * 1.5) * 0.55 : 0;
      for (var q = 0; q < 3; q++) d[o + q] = lut[n + q] + (ink[q] - lut[n + q]) * s;
      d[o + 3] = 255;
    }
    oc.getContext('2d').putImageData(img, 0, 0);
    var x = c.ctx, sc = c.w / nx; x.imageSmoothingEnabled = true; x.drawImage(oc, 0, 0, c.w, c.h);
    x.beginPath();
    for (var s = 0; s <= 40; s++) { var u = K.pow(s / 40, 2), p = toScreen(u, camber(u) + half(u)); x.lineTo(p[0] * sc, p[1] * sc); }
    for (s = 40; s >= 0; s--) { u = K.pow(s / 40, 2); p = toScreen(u, camber(u) - half(u)); x.lineTo(p[0] * sc, p[1] * sc); }
    x.closePath(); x.fillStyle = col.panel; x.fill(); x.lineWidth = 1.5; x.strokeStyle = col.ink; x.stroke();
    var C = coef(), ox = px * sc, oy = py * sc, L = ch * sc, Z = c.h * 0.42;
    arrow(x, ox, oy, ox, oy - K.max(-Z, K.min(Z, C.cl * L)), col.green, C.cl >= 0 ? 'lift' : 'downforce');
    arrow(x, ox, oy, ox + K.min(Z * 1.5, C.cd * L), oy, col.gold, 'drag');
    x.font = '13px system-ui,sans-serif'; x.fillStyle = col.ink; x.fillText('wind →', 8, 18);
    var lab = { p: ['low pressure', 'high pressure'], s: ['slower', 'faster'], w: ['spins counterclockwise', 'clockwise'] }[P.view];
    x.font = '12px system-ui,sans-serif'; key(x, 8, c.h - 10, lab, col);
    st.innerHTML = 'Angle <b>' + P.a + '°</b> · Reynolds number <b>' + K.round(reEff) + '</b> · ' + (C.cl >= 0 ? 'lift' : 'downforce') +
      ' coefficient <b>' + g.fmt(K.abs(C.cl), 2) + '</b> · drag coefficient <b>' + g.fmt(C.cd, 2) + '</b>';
  });
  function key(x, X, Y, lab, col) {
    var w0 = x.measureText(lab[0]).width; x.fillStyle = col.a(col.bg, 0.8); x.fillRect(X - 4, Y - 14, w0 + x.measureText(lab[1]).width + 72, 20);
    for (var n = 0; n < 2; n++) { x.fillStyle = 'rgb(' + [].slice.call(lut, n * 765, n * 765 + 3) + ')'; x.fillRect(X, Y - 9, 12, 10); x.fillStyle = col.ink; x.fillText(lab[n], X + 16, Y); X += w0 + 30; }
  }
  function arrow(x, a, b, e, h, color, label) {
    var l = K.hypot(e - a, h - b); if (l < 4) return;
    var p = (e - a) / l, q = (h - b) / l; x.strokeStyle = x.fillStyle = color; x.lineWidth = 3;
    x.beginPath(); x.moveTo(a, b); x.lineTo(e - p * 8, h - q * 8); x.stroke();
    x.beginPath(); x.moveTo(e, h); x.lineTo(e - p * 11 - q * 6, h - q * 11 + p * 6); x.lineTo(e - p * 11 + q * 6, h - q * 11 - p * 6); x.fill();
    x.font = 'bold 13px system-ui,sans-serif'; x.fillText(label, e + (q ? 7 : -12), h + (q ? 4 : 18));
  }
  function run(n) { for (var q = 0; q < n; q++) step(); if (!sane()) { P.re = K.max(50, K.round(P.re * 0.6)); reS.set(P.re); init(); g.say('The flow became unstable; it restarted at a lower Reynolds number.'); } }
  var busy = 0;
  function settle(n) {
    var id = ++busy; (function go() { if (id !== busy) return; run(K.min(n, 30)); n -= 30; if (n > 0) requestAnimationFrame(go); else g.redraw(); })();
  }
  var Lp = g.loop(function (dt) {
    if (dt >= 1) { run(80); g.redraw(); return; }
    var t0 = performance.now(); run(spf); var ms = performance.now() - t0;
    if (ms < 7 && spf < 20) spf++; else if (ms > 12 && spf > 1) spf--;
    g.redraw();
  }, { stepSize: 1, stepText: 'Step ahead' });
  function changed(msg) { mask(); setRe(); if (!Lp.playing()) settle(900); g.redraw(); if (msg) g.say(msg); }
  var row = g.group();
  var aS = g.slider({ parent: row, label: 'Angle of attack', min: -10, max: 25, value: P.a, fmt: function (v) { return v + '°'; }, input: function (v) { P.a = v; changed(); } });
  var mS = g.slider({ parent: row, label: 'Camber', min: 0, max: 9, value: P.m, fmt: function (v) { return v + '%'; }, input: function (v) { P.m = v; changed(); } });
  var tS = g.slider({ parent: row, label: 'Thickness', min: 6, max: 24, value: P.t, fmt: function (v) { return v + '%'; }, input: function (v) { P.t = v; changed(); } });
  var reS = g.slider({ parent: row, label: 'Reynolds number', min: 50, max: 800, step: 10, value: P.re, input: function (v) { P.re = v; changed(); } });
  var row2 = g.group();
  var flipB = g.toggle('Upside down (race car)', false, function (v) { P.flip = v; changed(v ? 'Upside down: the wing now pushes down.' : 'Right way up: the wing lifts.'); }, { parent: row2 });
  g.select({ parent: row2, label: 'Color shows', value: 'p', options: [['p', 'pressure'], ['s', 'speed'], ['w', 'swirl']], change: function (v) { P.view = v; g.redraw(); } });
  g.toggle('Smoke', true, function (v) { P.smoke = v; g.redraw(); }, { parent: row2 });
  function preset(a, m, t, fl, msg) { P.a = a; P.m = m; P.t = t; P.flip = fl; aS.set(a); mS.set(m); tS.set(t); flipB.checked = fl; changed(msg); }
  var row3 = g.group();
  g.button('Smooth flight', function () { preset(4, 4, 12, false, 'A gentle angle: the air follows both surfaces.'); }, { parent: row3 });
  g.button('Stall', function () { preset(22, 4, 12, false, 'A steep angle: the flow tears away from the top and swirls fill the wake.'); }, { parent: row3 });
  g.button('Race car wing', function () { preset(8, 7, 10, true, 'A curved wing, upside down: it pushes the car onto the road.'); }, { parent: row3 });
  g.button('↺ Restart flow', function () { init(); if (!Lp.playing()) settle(900); g.redraw(); g.say('The flow restarted.'); }, { parent: row3 });
  var st = g.out('', { parent: statsBox });
  g.bar.appendChild(g.el('p', 'gx-hint', 'Drag up or down on the picture, or use the arrow keys on it, to tilt the wing. Forces are measured in this small 2D model at a low Reynolds number; a race car wing works in the millions.'));
  var d0 = null;
  function tilt(a, say) { a = K.max(-10, K.min(25, K.round(a))); if (a !== P.a) { P.a = a; aS.set(a); changed(say && 'Angle of attack ' + a + ' degrees.'); } }
  g.drag(c.el, { down: function (X, Y) { d0 = [Y, P.a]; }, move: function (X, Y) { if (d0) tilt(d0[1] - (Y - d0[0]) / 6); }, up: function () { d0 = null; g.say('Angle of attack ' + P.a + ' degrees.'); } });
  g.keys(c.el, { ArrowUp: function () { tilt(P.a + 1, 1); }, ArrowDown: function () { tilt(P.a - 1, 1); } });
  c.onresize = function () { init(); if (!Lp.playing()) settle(900); };
  init(); if (g.reduced) settle(1500);
  var was = false;
  return { show: function () { c.fit(); if (was) Lp.play(); g.redraw(); }, hide: function () { was = Lp.playing(); Lp.pause(); } };
}

/* Euler's disk: Moffatt's model of the last stage of a spinning disk. Our own drawing, film model and sound. */
function diskScene(g, statsBox) {
  var K = Math, GR = 9.81, R = 0.04, THK = 0.2, T0 = 100, A0 = 10 * K.PI / 180, CUT = 0.002, MU = 1.8e-5, PITCH = 8, SLOW = 15;
  var outer = g.stage.parentNode;
  function narrow() { return (outer.clientWidth || 300) < 620; }
  var o = { min: 320, label: "A metal disk rolls on its edge on a table and slowly settles. Panels show the disk, the air film under it, and a graph of its tilt and wobble rate against time." };
  Object.defineProperty(o, 'aspect', { get: function () { return narrow() ? 1.6 : 0.6; } });
  Object.defineProperty(o, 'max', { get: function () { return narrow() ? 760 : 520; } });
  var c = g.canvas(o);
  var t = 0, phi = 0, psi = 0, stopped = false, speed = 5, logView = false, lastStep = 0;
  function tilt(tt) { return tt >= T0 - CUT && stopped ? 0 : A0 * K.cbrt(K.max(0, (T0 - tt) / T0)); }
  function omega(a) { return K.sqrt(4 * GR / (R * K.sin(K.max(a, 1e-7)))); }
  function hz(a) { return omega(a) / (2 * K.PI); }

  /* The air film. Gap h = a R (1 + xi), xi measured from the disk's center toward the high side, in units of R.
     Lubrication (Reynolds) equation: div(h^3 grad p) = 12 mu dh/dt. In the frame that turns with the contact point,
     p = (12 mu W / a^2) P(xi, eta) with div(H^3 grad P) = eta, H = 1 + xi, P = 0 at the rim. Solved once here. */
  var NG = 49, DX = 2 / (NG - 1), PF = new Float64Array(NG * NG), IN = new Uint8Array(NG * NG);
  (function solve() {
    var i, j, k, it, kk = [];
    for (j = 0; j < NG; j++) for (i = 0; i < NG; i++) { var x = -1 + i * DX, y = -1 + j * DX; IN[j * NG + i] = x * x + y * y < 0.995 ? 1 : 0; }
    function hc(x) { var h = K.max(0.02, 1 + x); return h * h * h; }
    for (j = 0; j < NG; j++) for (i = 0; i < NG; i++) { var xc = -1 + i * DX; kk.push([hc(xc + DX / 2), hc(xc - DX / 2), hc(xc), hc(xc)]); }
    for (it = 0; it < 2200; it++) for (j = 1; j < NG - 1; j++) for (i = 1; i < NG - 1; i++) {
      k = j * NG + i; if (!IN[k]) continue;
      var q = kk[k], s = q[0] + q[1] + q[2] + q[3], eta = -1 + j * DX;
      var nv = (q[0] * PF[k + 1] + q[1] * PF[k - 1] + q[2] * PF[k + NG] + q[3] * PF[k - NG] - DX * DX * eta) / s;
      PF[k] += 1.85 * (nv - PF[k]);
    }
  })();
  function P(xi, eta) {
    if (xi * xi + eta * eta >= 1) return 0;
    var fx = (xi + 1) / DX, fy = (eta + 1) / DX, i = K.min(NG - 2, fx | 0), j = K.min(NG - 2, fy | 0), a = fx - i, b = fy - j, k = j * NG + i;
    return (1 - b) * ((1 - a) * PF[k] + a * PF[k + 1]) + b * ((1 - a) * PF[k + NG] + a * PF[k + NG + 1]);
  }
  var NS = 64, SX = [], sP = new Float64Array(NS), sQ = new Float64Array(NS), sH = new Float64Array(NS);
  for (var n = 0; n < NS; n++) SX.push(-0.985 + 1.97 * n / (NS - 1));
  function slice(ph) { // along the lab x axis: pressure P, flux factor Q = H^2 dP/dx (air speed is -1.5 R W Q at mid-gap)
    var cs = K.cos(ph), sn = K.sin(ph), e = 0.012;
    for (var n = 0; n < NS; n++) {
      var x = SX[n]; sH[n] = 1 + x * cs; sP[n] = P(x * cs, -x * sn);
      var d = (P((x + e) * cs, -(x + e) * sn) - P((x - e) * cs, -(x - e) * sn)) / (2 * e);
      sQ[n] = sH[n] * sH[n] * d;
    }
  }
  var PMAX = 1e-9, QMAX = 1e-9;
  for (var m = 0; m < 72; m++) { slice(m * K.PI / 36); for (n = 0; n < NS; n++) { PMAX = K.max(PMAX, K.abs(sP[n])); QMAX = K.max(QMAX, K.abs(sQ[n])); } }

  /* sound: a whirr at PITCH x the contact point's frequency, a clatter at the end. Nothing is created before a tap. */
  var AC = null, au = null, soundOn = false, vol = 0.5, ssT = 0;
  function duck() { var nw = Date.now(); if (nw - ssT < 1500) return; ssT = nw; try { window.dispatchEvent(new Event('trb:sound-start')); } catch (e) { } }
  function ensureAudio() {
    if (AC) return true;
    var Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return false;
    try {
      AC = new Ctx(); au = {};
      au.m = AC.createGain(); au.m.gain.value = 0; au.m.connect(AC.destination);
      au.lp = AC.createBiquadFilter(); au.lp.type = 'lowpass'; au.lp.Q.value = 3; au.lp.connect(au.m);
      au.o1 = AC.createOscillator(); au.o1.type = 'sawtooth'; au.o1.connect(au.lp);
      au.g2 = AC.createGain(); au.g2.gain.value = 0.45; au.g2.connect(au.lp);
      au.o2 = AC.createOscillator(); au.o2.type = 'triangle'; au.o2.connect(au.g2);
      au.o1.start(); au.o2.start();
    } catch (e) { AC = null; return false; }
    return true;
  }
  function whirr(on) {
    if (!AC) return;
    var now = AC.currentTime, f = PITCH * hz(tilt(t)), lv = on && soundOn && !stopped ? vol * vol * 0.22 : 0;
    au.m.gain.setTargetAtTime(lv, now, 0.03);
    if (stopped || !(f < 4000)) return;
    au.o1.frequency.setTargetAtTime(f, now, 0.015); au.o2.frequency.setTargetAtTime(f * 2.004, now, 0.015);
    au.lp.frequency.setTargetAtTime(K.min(9000, f * 4), now, 0.03);
    if (lv > 0) duck();
  }
  function clatter() {
    if (!AC || !soundOn) return;
    try {
      var now = AC.currentTime, len = K.round(AC.sampleRate * 0.09), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (K.random() * 2 - 1) * K.exp(-i / (len / 7));
      var src = AC.createBufferSource(), ga = AC.createGain(); src.buffer = buf; ga.gain.value = vol * vol * 0.9;
      src.connect(ga); ga.connect(AC.destination); src.start(now);
      var th = AC.createOscillator(), gt = AC.createGain(); th.frequency.setValueAtTime(170, now); th.frequency.exponentialRampToValueAtTime(70, now + 0.18);
      gt.gain.setValueAtTime(vol * vol * 0.6, now); gt.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      th.connect(gt); gt.connect(AC.destination); th.start(now); th.stop(now + 0.25);
      au.m.gain.cancelScheduledValues(now); au.m.gain.setValueAtTime(0, now);
      duck();
    } catch (e) { }
  }
  setInterval(function () { if (AC && soundOn && (performance.now() - lastStep > 160 || document.hidden)) whirr(false); }, 120);

  function reset() { t = 0; phi = 0; psi = 0; stopped = false; }
  function finish() {
    t = T0 - CUT; stopped = true; clatter();
    g.say('The disk slaps flat and stops, a couple of milliseconds before the model\'s singular time.');
  }
  function advance(dtReal, dtModel) {
    var a = tilt(t), w = omega(a);
    phi += w * dtReal / SLOW; psi -= K.cos(a) * w * dtReal / SLOW;
    t += dtModel;
    if (t >= T0 - CUT) { finish(); return false; }
    return true;
  }
  var Lp = g.loop(function (dt) {
    if (stopped) reset();
    lastStep = performance.now();
    var left = T0 - t, rate = K.min(speed, K.max(0.05, left * 1.5));
    var ok = advance(dt, dt * rate);
    whirr(ok); g.redraw();
    return ok;
  }, { auto: false, stepSize: 1 / 30, stepText: 'Step' });

  function setT(nt, msg) {
    nt = K.max(0, nt);
    if (nt >= T0 - CUT) { if (!stopped) finish(); }
    else { stopped = false; t = nt; if (msg) g.say(msg + ' Tilt ' + g.fmt(tilt(t) * 180 / K.PI, 2) + ' degrees.'); }
    g.redraw();
  }

  /* layout */
  function panels() {
    var W = c.w, H = c.h;
    if (!narrow()) return { a: { x: 0, y: 0, w: W * 0.5, h: H * 0.54 }, b: { x: 0, y: H * 0.54, w: W * 0.5, h: H * 0.46 }, c: { x: W * 0.5, y: 0, w: W * 0.5, h: H } };
    return { a: { x: 0, y: 0, w: W, h: H * 0.34 }, b: { x: 0, y: H * 0.34, w: W, h: H * 0.27 }, c: { x: 0, y: H * 0.61, w: W, h: H * 0.39 } };
  }
  function hex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
  function mix(a, b, w) { var A = hex(a), B = hex(b); return 'rgb(' + K.round(A[0] + (B[0] - A[0]) * w) + ',' + K.round(A[1] + (B[1] - A[1]) * w) + ',' + K.round(A[2] + (B[2] - A[2]) * w) + ')'; }
  function title(x, p, s, col) { x.font = '600 13px system-ui,sans-serif'; x.fillStyle = col.ink; x.textAlign = 'left'; x.fillText(s, p.x + 10, p.y + 18); }
  function arrowH(x, x0, y0, L, color) {
    if (K.abs(L) < 2.5) return;
    var d = L > 0 ? 1 : -1, hl = K.min(5, K.abs(L) * 0.5);
    x.strokeStyle = x.fillStyle = color; x.lineWidth = 1.3;
    x.beginPath(); x.moveTo(x0 - L / 2, y0); x.lineTo(x0 + L / 2 - d * hl, y0); x.stroke();
    x.beginPath(); x.moveTo(x0 + L / 2, y0); x.lineTo(x0 + L / 2 - d * hl, y0 - 3); x.lineTo(x0 + L / 2 - d * hl, y0 + 3); x.fill();
  }

  function drawDisk(x, p, col, a) {
    title(x, p, '(a) The disk on its table', col);
    var EL = 0.42, se = K.sin(EL), ce = K.cos(EL), s = K.min(p.w * 0.22, p.h * 0.4) / R, cx = p.x + p.w * 0.42, cy = p.y + p.h * 0.6;
    function pr(X, Y, Z) { return [cx + s * X, cy - s * (Z * ce + Y * se)]; }
    var i, q, th, n = 72;
    // table
    x.beginPath(); for (i = 0; i <= n; i++) { th = i / n * 2 * K.PI; q = pr(1.5 * R * K.cos(th), 1.5 * R * K.sin(th), 0); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }
    x.fillStyle = col.panel; x.fill(); x.strokeStyle = col.grid; x.lineWidth = 1; x.stroke();
    // the slice line (b) and the contact point's circle
    var ca = K.cos(a), sa = K.sin(a), cp = K.cos(phi), sp = K.sin(phi);
    x.setLineDash([3, 4]); x.strokeStyle = col.green; x.beginPath();
    for (i = 0; i <= n; i++) { th = i / n * 2 * K.PI; q = pr(R * ca * K.cos(th), R * ca * K.sin(th), 0); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }
    x.stroke(); x.setLineDash([]);
    var l0 = pr(-1.45 * R, 0, 0), l1 = pr(1.45 * R, 0, 0);
    x.strokeStyle = col.gold; x.lineWidth = 2; x.setLineDash([7, 4]); x.beginPath(); x.moveTo(l0[0], l0[1]); x.lineTo(l1[0], l1[1]); x.stroke(); x.setLineDash([]);
    x.font = '11px system-ui,sans-serif'; x.fillStyle = col.gold; x.textAlign = 'right'; x.fillText('slice (b)', l1[0] + 4, l1[1] + 14);
    // disk frame: u points from the center down to the contact point, n is the top face's normal
    var u = [-ca * cp, -ca * sp, -sa], nn = [-sa * cp, -sa * sp, ca], v = [nn[1] * u[2] - nn[2] * u[1], nn[2] * u[0] - nn[0] * u[2], nn[0] * u[1] - nn[1] * u[0]];
    var C = [0, 0, R * sa], T = THK * R, view = [0, -ce, se];
    function rim(th, top) { var k = K.cos(th) * R, l = K.sin(th) * R, e = top ? T : 0; return [C[0] + k * u[0] + l * v[0] + e * nn[0], C[1] + k * u[1] + l * v[1] + e * nn[1], C[2] + k * u[2] + l * v[2] + e * nn[2]]; }
    var dk = col.dark, side = dk ? '#3d4a43' : '#8d9a92', face = dk ? '#62726a' : '#cfd7d2', edge = col.ink;
    for (i = 0; i < n; i++) {
      var t0 = i / n * 2 * K.PI, t1 = (i + 1) / n * 2 * K.PI, tm = (t0 + t1) / 2;
      var rn = [K.cos(tm) * u[0] + K.sin(tm) * v[0], K.cos(tm) * u[1] + K.sin(tm) * v[1], K.cos(tm) * u[2] + K.sin(tm) * v[2]];
      var f = rn[0] * view[0] + rn[1] * view[1] + rn[2] * view[2]; if (f <= 0) continue;
      var A = rim(t0, 0), B = rim(t1, 0), Cc = rim(t1, 1), D = rim(t0, 1), pa = pr(A[0], A[1], A[2]), pb = pr(B[0], B[1], B[2]), pc = pr(Cc[0], Cc[1], Cc[2]), pd = pr(D[0], D[1], D[2]);
      x.beginPath(); x.moveTo(pa[0], pa[1]); x.lineTo(pb[0], pb[1]); x.lineTo(pc[0], pc[1]); x.lineTo(pd[0], pd[1]); x.closePath();
      x.fillStyle = mix(side, face, K.max(0, 0.15 + 0.5 * rn[0])); x.fill(); x.strokeStyle = x.fillStyle; x.lineWidth = 0.6; x.stroke();
    }
    var up = nn[0] * view[0] + nn[1] * view[1] + nn[2] * view[2] > 0;
    x.beginPath(); for (i = 0; i <= n; i++) { q = rim(i / n * 2 * K.PI, up); q = pr(q[0], q[1], q[2]); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }
    x.fillStyle = face; x.fill(); x.strokeStyle = edge; x.lineWidth = 1.2; x.stroke();
    // a mark on the face: it turns at W(1 - cos a), much slower than the wobble
    var mc = [C[0] + T * nn[0], C[1] + T * nn[1], C[2] + T * nn[2]], cq = pr(mc[0], mc[1], mc[2]);
    var mk = [mc[0] + 0.75 * R * (K.cos(psi) * u[0] + K.sin(psi) * v[0]), mc[1] + 0.75 * R * (K.cos(psi) * u[1] + K.sin(psi) * v[1]), mc[2] + 0.75 * R * (K.cos(psi) * u[2] + K.sin(psi) * v[2])], mq = pr(mk[0], mk[1], mk[2]);
    x.strokeStyle = col.gold; x.lineWidth = 3; x.beginPath(); x.moveTo(cq[0], cq[1]); x.lineTo(mq[0], mq[1]); x.stroke();
    x.fillStyle = col.gold; x.beginPath(); x.arc(mq[0], mq[1], 3.5, 0, 7); x.fill();
    // contact point
    var P0 = pr(C[0] + R * u[0], C[1] + R * u[1], 0);
    x.fillStyle = col.green; x.beginPath(); x.arc(P0[0], P0[1], 4.5, 0, 7); x.fill();
    x.font = '11px system-ui,sans-serif'; x.textAlign = 'left'; x.fillStyle = col.muted;
    x.fillText(stopped ? 'at rest' : 'green dot: contact point · wobble drawn ' + SLOW + '× slower', p.x + 10, p.y + p.h - 8);
    // side view at the true angle
    var bx = p.x + p.w - 92, by = p.y + 50, L = 72;
    x.strokeStyle = col.axis; x.lineWidth = 1; x.beginPath(); x.moveTo(bx - 6, by); x.lineTo(bx + L + 6, by); x.stroke();
    x.save(); x.translate(bx, by); x.rotate(-a); x.fillStyle = side; x.fillRect(0, -6, L, 6); x.strokeStyle = edge; x.strokeRect(0, -6, L, 6); x.restore();
    x.fillStyle = col.ink; x.font = '11px system-ui,sans-serif'; x.textAlign = 'left';
    x.fillText('side view, true angle', bx - 18, by + 15);
    x.font = '600 12px system-ui,sans-serif'; x.fillText('α = ' + g.fmt(a * 180 / K.PI, a < 0.0175 ? 2 : 1) + '°', bx + 2, by - 20);
  }

  function drawFilm(x, p, col, a) {
    title(x, p, '(b) Air under the disk, along the gold line (model)', col);
    var lx = p.x + 14, rx = p.x + p.w - 14, ty = p.y + 28, by = p.y + p.h - 26, wd = rx - lx, hm = (by - ty) * 0.8;
    x.fillStyle = col.grid; x.fillRect(lx, by, wd, 7);
    x.font = '11px system-ui,sans-serif'; x.textAlign = 'left';
    var side = col.dark ? '#62726a' : '#cfd7d2', n;
    if (stopped) {
      x.fillStyle = side; x.fillRect(lx, by - 16, wd, 16); x.strokeStyle = col.ink; x.strokeRect(lx, by - 16, wd, 16);
      x.fillStyle = col.ink; x.textAlign = 'center'; x.fillText('the gap has closed: the disk lies flat', lx + wd / 2, by - 24);
      return;
    }
    slice(phi);
    function X(n) { return lx + (SX[n] + 1) / 2 * wd; }
    function Yh(n) { return by - sH[n] / 2 * hm; }
    // the air: colored by pressure
    var lo = col.blue, hi = col.red;
    for (n = 0; n < NS - 1; n++) {
      var pv = (sP[n] + sP[n + 1]) / 2 / PMAX, w = K.min(1, K.pow(K.abs(pv) * 1.8, 0.6));
      x.fillStyle = mix(col.bg, pv < 0 ? lo : hi, w * 0.9);
      var x0 = X(n), x1 = X(n + 1);
      x.beginPath(); x.moveTo(x0, by); x.lineTo(x0, Yh(n)); x.lineTo(x1, Yh(n + 1)); x.lineTo(x1, by); x.closePath(); x.fill();
    }
    // the disk's underside, and the disk above it
    x.beginPath(); x.moveTo(lx - 2, Yh(0)); for (n = 0; n < NS; n++) x.lineTo(X(n), Yh(n)); x.lineTo(rx + 2, Yh(NS - 1)); x.lineTo(rx + 2, ty); x.lineTo(lx - 2, ty); x.closePath();
    x.fillStyle = side; x.fill();
    x.beginPath(); for (n = 0; n < NS; n++) { if (n) x.lineTo(X(n), Yh(n)); else x.moveTo(X(n), Yh(n)); } x.strokeStyle = col.ink; x.lineWidth = 1.4; x.stroke();
    x.fillStyle = col.ink; x.textAlign = 'left'; x.font = '11px system-ui,sans-serif'; x.fillText('disk', lx + 6, ty + 14);
    // air flow along the slice: a flat parabola across the gap (Poiseuille), drawn at three heights
    var Lmax = wd * 0.075;
    for (var st = 4; st < NS - 3; st += 6) {
      var gp = by - Yh(st); if (gp < 9) continue;
      for (var zz = 1; zz <= 3; zz++) { var z = zz / 4, prof = z * (1 - z) / 0.25; arrowH(x, X(st), by - z * gp, -sQ[st] / QMAX * Lmax * prof, col.ink); }
    }
    // labels
    var stretch = hm / (wd * K.tan(a)), gapMm = 2 * R * K.tan(a) * 1000;
    x.fillStyle = col.ink; x.textAlign = 'right';
    x.fillText('heights stretched ×' + g.fmt(stretch < 20 ? stretch : K.round(stretch / 10) * 10, stretch < 10 ? 1 : 0) + ' · widest gap ' + g.fmt(gapMm, gapMm < 1 ? 2 : 1) + ' mm', rx - 4, ty + 14);
    var ky = p.y + p.h - 5; x.textAlign = 'left';
    x.fillStyle = mix(col.bg, lo, 0.85); x.fillRect(lx, ky - 9, 11, 9); x.fillStyle = col.ink; x.fillText('suction', lx + 15, ky);
    var w1 = x.measureText('suction').width + 30;
    x.fillStyle = mix(col.bg, hi, 0.85); x.fillRect(lx + w1, ky - 9, 11, 9); x.fillStyle = col.ink; x.fillText('squeezed', lx + w1 + 15, ky);
    var w2 = w1 + x.measureText('squeezed').width + 30;
    x.fillText('→ air flow', lx + w2, ky);
  }

  function drawGraph(x, p, col, a) {
    title(x, p, '(c) Tilt and wobble rate against time', col);
    var narrowG = p.w < 420, gx = p.x + 46, gy = p.y + 30, gw = p.w - 46 - 50, gh = p.h - 34 - (narrowG ? 46 : 44);
    var L10 = function (v) { return K.log(v) / K.LN10; };
    var X, Ya, Yf, i, tt;
    if (!logView) {
      X = function (tt) { return gx + gw * tt / T0; };
      Ya = function (d) { return gy + gh * (1 - d / 10); };
      Yf = function (f) { return gy + gh * (1 - f / 100); };
    } else {
      X = function (tt) { return gx + gw * (2 - L10(K.max(1e-4, T0 - tt))) / 6; };
      Ya = function (d) { return gy + gh * (1 - (L10(d) + 1) / 2); };
      Yf = function (f) { return gy + gh * (1 - (L10(f) - 1) / 1.5); };
    }
    x.save(); x.font = '11px system-ui,sans-serif'; x.lineWidth = 1;
    // grid and axes
    x.strokeStyle = col.grid; x.fillStyle = col.muted; x.textAlign = 'center';
    var xt = logView ? [0, 90, 99, 99.9, 99.99, 99.999, 99.9999] : [0, 20, 40, 60, 80, 100];
    var xl = logView ? ['100', '10', '1', '0.1', '0.01', '0.001', '0.0001'] : ['0', '20', '40', '60', '80', '100'];
    for (i = 0; i < xt.length; i++) { var px = X(xt[i]); x.beginPath(); x.moveTo(px, gy); x.lineTo(px, gy + gh); x.stroke(); if (!narrowG || i % 2 === 0 || !logView) x.fillText(xl[i], px, gy + gh + 14); }
    x.fillText(logView ? 'time left before t₀ (seconds, log scale)' : 'time (seconds); t₀ = 100 s', gx + gw / 2, gy + gh + 30);
    var at = logView ? [0.1, 0.3, 1, 3, 10] : [0, 2, 4, 6, 8, 10], ft = logView ? [10, 30, 100, 300] : [0, 20, 40, 60, 80, 100];
    x.textAlign = 'right'; x.fillStyle = col.green;
    for (i = 0; i < at.length; i++) { var py = Ya(at[i]); x.strokeStyle = col.grid; x.beginPath(); x.moveTo(gx, py); x.lineTo(gx + gw, py); x.stroke(); x.fillText(String(at[i]), gx - 5, py + 4); }
    x.textAlign = 'left'; x.fillStyle = col.gold;
    for (i = 0; i < ft.length; i++) x.fillText(String(ft[i]), gx + gw + 5, Yf(ft[i]) + 4);
    x.strokeStyle = col.axis; x.strokeRect(gx, gy, gw, gh);
    x.font = '600 11px system-ui,sans-serif'; x.textAlign = 'center';
    x.save(); x.translate(p.x + 11, gy + gh / 2); x.rotate(-K.PI / 2); x.fillStyle = col.green; x.fillText('tilt α (degrees)', 0, 0); x.restore();
    x.save(); x.translate(p.x + p.w - 15, gy + gh / 2); x.rotate(K.PI / 2); x.fillStyle = col.gold; x.fillText('contact point: rounds per second', 0, 0); x.restore();
    // curves: solid up to the cut-off, dashed past it (the model alone)
    x.save(); x.beginPath(); x.rect(gx, gy, gw, gh); x.clip();
    function curve(f, Y, color) {
      x.strokeStyle = color; x.lineWidth = 2.2;
      for (var part = 0; part < 2; part++) {
        x.setLineDash(part ? [4, 4] : []); x.beginPath();
        for (var k = 0; k <= 400; k++) {
          var left = part ? CUT * K.pow(1e-3, k / 400) : T0 * K.pow(CUT / T0, k / 400);
          if (!part && !logView) left = T0 * K.pow(1 - k / 400, 3) + CUT * (k / 400);
          var q = Y(f(A0 * K.cbrt(left / T0)));
          if (k) x.lineTo(X(T0 - left), q); else x.moveTo(X(T0 - left), q);
        }
        x.stroke();
      }
      x.setLineDash([]);
    }
    curve(function (aa) { return aa * 180 / K.PI; }, Ya, col.green);
    curve(hz, Yf, col.gold);
    // cut-off, and now
    var xc = X(T0 - CUT); x.strokeStyle = col.red; x.setLineDash([2, 3]); x.lineWidth = 1.2; x.beginPath(); x.moveTo(xc, gy); x.lineTo(xc, gy + gh); x.stroke(); x.setLineDash([]);
    x.restore();
    x.fillStyle = col.red; x.font = '600 11px system-ui,sans-serif'; x.textAlign = 'right';
    x.fillText('the disk stops', xc - 4, gy + 13);
    var xn = X(t);
    x.strokeStyle = col.ink; x.lineWidth = 1; x.beginPath(); x.moveTo(xn, gy); x.lineTo(xn, gy + gh); x.stroke();
    if (!stopped) {
      var dA = a * 180 / K.PI, fA = hz(a);
      x.fillStyle = col.green; x.beginPath(); x.arc(xn, K.max(gy, K.min(gy + gh, Ya(K.max(0.1, dA)))), 4.5, 0, 7); x.fill();
      x.fillStyle = col.gold; x.beginPath(); x.arc(xn, K.max(gy, K.min(gy + gh, Yf(K.max(10, fA)))), 4.5, 0, 7); x.fill();
    }
    x.restore();
  }

  g.draw(function (col) {
    var x = c.ctx, p = panels(), a = stopped ? 0 : tilt(t);
    x.fillStyle = col.bg; x.fillRect(0, 0, c.w, c.h);
    drawDisk(x, p.a, col, a); drawFilm(x, p.b, col, K.max(a, 1e-6)); drawGraph(x, p.c, col, a);
    x.strokeStyle = col.grid; x.lineWidth = 1; x.beginPath();
    if (!narrow()) { x.moveTo(p.c.x + 0.5, 6); x.lineTo(p.c.x + 0.5, c.h - 6); x.moveTo(6, p.b.y + 0.5); x.lineTo(p.b.w - 6, p.b.y + 0.5); }
    else { x.moveTo(6, p.b.y + 0.5); x.lineTo(c.w - 6, p.b.y + 0.5); x.moveTo(6, p.c.y + 0.5); x.lineTo(c.w - 6, p.c.y + 0.5); }
    x.stroke();
    var f = hz(a), left = T0 - t, air = 1.5 * R * omega(K.max(a, 1e-6)) * QMAX;
    st.innerHTML = stopped ? 'The disk has stopped. In the model, the wobble rate would have become infinite at <b>t₀ = 100 s</b>.' :
      'Time <b>' + g.fmt(t, left < 1 ? 3 : 1) + ' s</b> · tilt <b>' + g.fmt(a * 180 / K.PI, a < 0.0175 ? 2 : 1) + '°</b> · contact point goes round <b>' + g.fmt(f, 0) + ' times a second</b>' +
      (soundOn ? ' · sound pitch <b>' + g.fmt(f * PITCH, 0) + ' Hz</b> (raised ×' + PITCH + ')' : '') +
      ' · fastest air in the slice about <b>' + g.fmt(air, 1) + ' m/s</b>' + (Lp.playing() ? ' · playback ×' + g.fmt(K.min(speed, K.max(0.05, left * 1.5)), left * 1.5 < 1 ? 2 : 0) : '');
  });

  var row = g.group();
  // the loop's buttons are added to the bar by g.loop; move them into this row
  var pbs = g.bar.querySelectorAll('.gx-play, .gx-step'); for (var b = 0; b < pbs.length; b++) row.appendChild(pbs[b]);
  g.button('↺ Restart', function () { reset(); g.redraw(); g.say('Back to the start: tilt 10 degrees.'); }, { parent: row });
  g.select({ parent: row, label: 'Speed', value: '5', options: [['1', 'real time'], ['5', '5× faster'], ['20', '20× faster']], change: function (v) { speed = +v; g.redraw(); } });
  g.select({ parent: row, label: 'Graph', value: 'lin', options: [['lin', 'against time'], ['log', 'time left, log scales']], change: function (v) { logView = v === 'log'; g.redraw(); } });
  var row2 = g.group();
  var sb = g.button('🔈 Sound: off', function () {
    if (!soundOn && !ensureAudio()) { g.say('Sound is not available in this browser.'); return; }
    soundOn = !soundOn;
    if (soundOn && AC.state === 'suspended') AC.resume();
    sb.textContent = soundOn ? '🔊 Sound: on' : '🔈 Sound: off'; sb.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
    if (soundOn && !Lp.playing()) { if (stopped) reset(); Lp.play(); }
    whirr(soundOn && Lp.playing()); g.redraw();
    g.say(soundOn ? 'Sound on: the whirr follows the contact point, raised ' + PITCH + ' times in pitch.' : 'Sound off.');
  }, { parent: row2 });
  sb.setAttribute('aria-pressed', 'false');
  g.slider({ parent: row2, label: 'Volume', min: 0, max: 100, value: 50, fmt: function (v) { return v + '%'; }, input: function (v) { vol = v / 100; whirr(Lp.playing()); } });
  var st = g.out('', { parent: statsBox });
  g.bar.appendChild(g.el('p', 'gx-hint', 'A model, not a recording: Moffatt\'s air-film law with a 4 cm disk starting at 10°, timed so the singularity t₀ falls at 100 s. Playback slows near the end so you can see it. Sound plays only after you turn it on. On the picture: the right arrow key halves the time left, the left arrow doubles it; drag on the graph to move in time.'));
  // scrubbing on the graph, keys on the picture
  function graphT(X, Y) {
    var p = panels().c, gx = p.x + 46, gw = p.w - 96;
    if (X < p.x || Y < p.y || Y > p.y + p.h) return null;
    var f = K.max(0, K.min(1, (X - gx) / gw));
    return logView ? T0 - K.pow(10, 2 - 6 * f) : f * T0;
  }
  var dragging = false;
  g.drag(c.el, {
    touch: 'pan-y',
    down: function (X, Y) { var nt = graphT(X, Y); if (nt == null) return; dragging = true; Lp.pause(); setT(nt); },
    move: function (X, Y) { if (!dragging) return; var nt = graphT(X, Y); if (nt != null) setT(nt); },
    up: function () { if (dragging) { dragging = false; g.say('Time ' + g.fmt(t, 2) + ' seconds; tilt ' + g.fmt(tilt(t) * 180 / K.PI, 2) + ' degrees.'); } }
  });
  g.keys(c.el, {
    ArrowRight: function () { Lp.pause(); setT(T0 - (T0 - t) / 2, 'Half the time left.'); },
    ArrowLeft: function () { Lp.pause(); if (stopped) { stopped = false; t = T0 - 2 * CUT; } setT(K.max(0, T0 - (T0 - t) * 2), 'Twice the time left.'); },
    Home: function () { Lp.pause(); reset(); g.redraw(); g.say('Back to the start.'); }
  });
  c.onresize = function () { g.redraw(); };
  return {
    show: function () { c.fit(); g.redraw(); },
    hide: function () { Lp.pause(); whirr(false); }
  };
}

/* ---- Shared by "Shapes, cars & animals" and "Shape Lab": a lattice Boltzmann flow (D2Q9, BGK) around any body made
   of polygons, with an optional ground (still, or rolling with the wind as on a wind tunnel's rolling road). Forces on
   the body by momentum exchange (the bounces off the body, added up); the ground's push is not counted. */
function Flow() {
  var K = Math, EX = [0, 1, 0, -1, 0, 1, -1, -1, 1], EY = [0, 0, 1, 0, -1, 1, 1, -1, -1], OP = [0, 3, 4, 1, 2, 7, 8, 5, 6],
    WT = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36], OF = new Int32Array(9), HB = new Float64Array(9);
  var F = { nx: 0, ny: 0, N: 0, U: 0.1, tau: 0.55, ground: 0, rolling: false, t: 0, fx: 0, fy: 0, Fx: 0, Fy: 0, sx: 0, sy: 0, sn: 0, smoke: true };
  function A(n) { return new Float32Array(n); }
  function eq(f, N, k, r, vx, vy) {
    var uu = 1.5 * (vx * vx + vy * vy);
    for (var i = 0; i < 9; i++) { var cu = 3 * (EX[i] * vx + EY[i] * vy); f[i * N + k] = WT[i] * r * (1 + cu + 0.5 * cu * cu - uu); }
  }
  F.init = function (nx, ny, U, nu, ground) {
    var N = nx * ny; F.nx = nx; F.ny = ny; F.N = N; F.U = U; F.tau = 0.5 + 3 * nu; F.ground = ground ? 1 : 0;
    F.f = A(9 * N); F.f2 = A(9 * N); F.rho = A(N); F.ux = A(N); F.uy = A(N); F.sm = A(N); F.sm2 = A(N);
    F.solid = new Uint8Array(N);
    if (ground) for (var x = 0; x < nx; x++) F.solid[(ny - 1) * nx + x] = 2;
    F.near = null;
    for (var k = 0; k < N; k++) { eq(F.f, N, k, 1, U, 0); F.rho[k] = 1; F.ux[k] = U; }
    F.t = 0; F.fx = F.fy = F.Fx = F.Fy = 0; F.avg(false);
  };
  F.setNu = function (nu) { F.tau = 0.5 + 3 * nu; };
  /* inside(i, j) -> true for cells of the body */
  F.setBody = function (inside) {
    var nx = F.nx, ny = F.ny, s = F.solid, ylim = ny - F.ground;
    for (var j = 0; j < ylim; j++) for (var i = 0; i < nx; i++) {
      var k = j * nx + i, b = inside(i, j) ? 1 : 0;
      if (s[k] === 1 && !b) { eq(F.f, F.N, k, 1, 0, 0); F.sm[k] = 0; F.ux[k] = F.uy[k] = 0; F.rho[k] = 1; }
      s[k] = b;
    }
    F.near = null;
  };
  F.avg = function (on) { F.sx = F.sy = F.sn = 0; F.avgOn = on; };
  /* near[k] = 1 where a neighbor is solid: those cells take the careful path, the rest an unrolled fast one */
  function near() {
    var nx = F.nx, ny = F.ny, s = F.solid, nr = F.near = new Uint8Array(F.N);
    for (var j = 1; j < ny - 1; j++) for (var x = 1; x < nx - 1; x++) {
      var k = j * nx + x;
      for (var i = 1; i < 9; i++) if (s[k - EX[i] - EY[i] * nx]) { nr[k] = 1; break; }
    }
  }
  F.step = function () {
    var nx = F.nx, ny = F.ny, N = F.N, f = F.f, f2 = F.f2, rho = F.rho, ux = F.ux, uy = F.uy, solid = F.solid, U = F.U, nr = F.near;
    if (!nr) { near(); nr = F.near; }
    var om = 1 / F.tau, k, i, fx = 0, fy = 0, h = HB, x, j, ug = F.rolling ? U : 0, jEnd = ny - 1, w0 = 4 / 9 * om, w1 = om / 9, w2 = om / 36, mo = 1 - om;
    var N2 = 2 * N, N3 = 3 * N, N4 = 4 * N, N5 = 5 * N, N6 = 6 * N, N7 = 7 * N, N8 = 8 * N;
    for (i = 0; i < 9; i++) OF[i] = EX[i] + EY[i] * nx;
    for (j = 1; j < jEnd; j++) for (x = 1, k = j * nx + 1; x < nx - 1; x++, k++) {
      if (solid[k]) continue;
      var r, vx, vy, uu, c;
      if (!nr[k]) {
        var a0 = f[k], a1 = f[N + k - 1], a2 = f[N2 + k - nx], a3 = f[N3 + k + 1], a4 = f[N4 + k + nx], a5 = f[N5 + k - 1 - nx], a6 = f[N6 + k + 1 - nx], a7 = f[N7 + k + 1 + nx], a8 = f[N8 + k - 1 + nx];
        r = a0 + a1 + a2 + a3 + a4 + a5 + a6 + a7 + a8;
        vx = (a1 - a3 + a5 - a6 - a7 + a8) / r; vy = (a2 - a4 + a5 + a6 - a7 - a8) / r;
        rho[k] = r; ux[k] = vx; uy[k] = vy;
        uu = 1 - 1.5 * (vx * vx + vy * vy);
        f2[k] = mo * a0 + w0 * r * uu;
        c = vx; f2[N + k] = mo * a1 + w1 * r * (uu + 3 * c + 4.5 * c * c);
        c = vy; f2[N2 + k] = mo * a2 + w1 * r * (uu + 3 * c + 4.5 * c * c);
        c = -vx; f2[N3 + k] = mo * a3 + w1 * r * (uu + 3 * c + 4.5 * c * c);
        c = -vy; f2[N4 + k] = mo * a4 + w1 * r * (uu + 3 * c + 4.5 * c * c);
        c = vx + vy; f2[N5 + k] = mo * a5 + w2 * r * (uu + 3 * c + 4.5 * c * c);
        c = vy - vx; f2[N6 + k] = mo * a6 + w2 * r * (uu + 3 * c + 4.5 * c * c);
        c = -vx - vy; f2[N7 + k] = mo * a7 + w2 * r * (uu + 3 * c + 4.5 * c * c);
        c = vx - vy; f2[N8 + k] = mo * a8 + w2 * r * (uu + 3 * c + 4.5 * c * c);
        continue;
      }
      r = 0; vx = 0; vy = 0;
      for (i = 0; i < 9; i++) {
        var src = k - OF[i], v, sc = solid[src];
        if (sc) {
          v = f[OP[i] * N + k];
          if (sc === 1) { fx -= 2 * v * EX[i]; fy -= 2 * v * EY[i]; } else if (ug) v += 6 * WT[i] * EX[i] * ug;
        } else v = f[i * N + src];
        h[i] = v; r += v; vx += v * EX[i]; vy += v * EY[i];
      }
      vx /= r; vy /= r; rho[k] = r; ux[k] = vx; uy[k] = vy;
      uu = 1.5 * (vx * vx + vy * vy);
      for (i = 0; i < 9; i++) { var cu = 3 * (EX[i] * vx + EY[i] * vy); f2[i * N + k] = h[i] + om * (WT[i] * r * (1 + cu + 0.5 * cu * cu - uu) - h[i]); }
    }
    var tmp = f; F.f = f = f2; F.f2 = f2 = tmp;
    // a small, fixed nudge at the start, the same every time, so symmetric bodies begin to shed swirls on cue
    var vy0 = F.t < 400 ? 0.06 * U * K.sin(F.t * 0.05) : 0;
    // inlet: the wind; outlet: pressure held at the open-air value, velocity carried out (lets pressure waves leave)
    for (j = 0; j < ny - F.ground; j++) { eq(f, N, j * nx, 1, U, vy0); var ko = j * nx + nx - 2; eq(f, N, ko + 1, 1, ux[ko], uy[ko]); }
    // top (and bottom without a ground): open, copied from the row inside
    for (x = 0; x < nx; x++) { eq(f, N, x, 1, U, 0); if (!F.ground) eq(f, N, N - nx + x, 1, U, 0); }
    F.fx = fx; F.fy = fy; F.Fx += (fx - F.Fx) * 0.02; F.Fy += (fy - F.Fy) * 0.02;
    if (F.avgOn) { F.sx += fx; F.sy += fy; F.sn++; }
    F.t++;
    if (F.smoke) smoke();
  };
  function smoke() {
    var nx = F.nx, ny = F.ny, sm = F.sm, sm2 = F.sm2, ux = F.ux, uy = F.uy, solid = F.solid, x, j, k;
    for (j = 1; j < ny - 1; j++) for (x = 1; x < nx - 1; x++) {
      k = j * nx + x; if (solid[k]) { sm2[k] = 0; continue; }
      var sx = K.max(0, K.min(nx - 1.01, x - ux[k])), sy = K.max(0, K.min(ny - 1.01, j - uy[k])), i0 = sx | 0, j0 = sy | 0, a = sx - i0, b = sy - j0, q0 = j0 * nx + i0;
      sm2[k] = 0.9995 * ((1 - b) * ((1 - a) * sm[q0] + a * sm[q0 + 1]) + b * ((1 - a) * sm[q0 + nx] + a * sm[q0 + nx + 1]));
    }
    F.sm2 = sm; F.sm = sm = sm2;
    var gap = K.max(6, K.round(ny / 11));
    for (j = 0; j < ny; j++) sm[j * nx] = sm[j * nx + 1] = j % gap ? 0 : 1;
  }
  F.sane = function () { var r = F.rho[(F.ny >> 2) * F.nx + 2], q = F.rho[(F.ny >> 1) * F.nx + (F.nx >> 1)]; return r === r && q === q && K.abs(r - 1) < 0.5 && K.abs(q - 1) < 0.6; };
  /* coefficients per unit span, with reference length ref (cells): drag along the wind, lift up (negative = downforce) */
  F.coef = function (ref, mean) {
    var d = 0.5 * F.U * F.U * ref, X = mean ? F.sx / K.max(1, F.sn) : F.Fx, Y = mean ? F.sy / K.max(1, F.sn) : F.Fy;
    return { cd: X / d, cl: -Y / d };
  };
  return F;
}

/* Bodies. Each is drawn in its own units (length about 1, y up) as closed polygons; Chaikin corner-cutting rounds the
   corners except at points marked sharp (a third number 1). Our own drawings, from general proportions only. */
function chaikin(pts, it) {
  for (var n = 0; n < it; n++) {
    var out = [], m = pts.length;
    for (var i = 0; i < m; i++) {
      var p = pts[i], q = pts[(i + 1) % m];
      out.push(p[2] ? p : [0.75 * p[0] + 0.25 * q[0], 0.75 * p[1] + 0.25 * q[1]]);
      out.push([0.25 * p[0] + 0.75 * q[0], 0.25 * p[1] + 0.75 * q[1]]);
    }
    pts = out;
  }
  return pts;
}
function nacaPts(m, p, t, n, sharpTail) { // closed polygon, chord 0..1, y up, upper surface then lower
  var up = [], lo = [], K = Math;
  for (var i = 0; i <= n; i++) {
    var s = (1 - K.cos(K.PI * i / n)) / 2, h = 5 * t * (0.2969 * K.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s * s * s - 0.1036 * s * s * s * s);
    var c = m ? (s < p ? m / (p * p) * (2 * p * s - s * s) : m / ((1 - p) * (1 - p)) * (1 - 2 * p + 2 * p * s - s * s)) : 0;
    up.push([s, c + h]); lo.push([s, c - h]);
  }
  var out = up.slice(); if (sharpTail !== false) out[out.length - 1][2] = 1;
  for (i = n - 1; i > 0; i--) out.push(lo[i]);
  return out;
}
function xform(pts, dx, dy, sc, deg, flipY) { // scale, flip, rotate (deg, counterclockwise) about the origin, then move
  var a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map(function (p) { var x = p[0] * sc, y = (flipY ? -p[1] : p[1]) * sc; return [dx + x * c - y * s, dy + x * s + y * c, p[2]]; });
}
function circlePts(cx, cy, r, n, dents) {
  var out = [];
  for (var i = 0; i < n; i++) { var a = 2 * Math.PI * i / n, rr = r; if (dents) { var ph = (a * dents / (2 * Math.PI)) % 1; rr -= r * 0.08 * Math.max(0, Math.sin(Math.PI * Math.min(1, ph / 0.6))); } out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); }
  return out;
}
/* an inverted wing element (for race cars): leading edge at (x, y), chord c, trailing edge raised by deg degrees */
function invWing(x, y, c, deg, m, t) { return xform(nacaPts(m, 0.4, t, 14), x, y, c, deg, true); }
/* a body with separate upper and lower outlines y = up(s), lo(s) for s in 0..1 */
function outline(up, lo, n) {
  var out = [], i, s;
  for (i = 0; i <= n; i++) { s = (1 - Math.cos(Math.PI * i / n)) / 2; out.push([s, up(s)]); }
  for (i = n - 1; i > 0; i--) { s = (1 - Math.cos(Math.PI * i / n)) / 2; out.push([s, lo(s)]); }
  return out;
}
function thick(s, t) { return 5 * t * (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s * s * s - 0.1036 * s * s * s * s); }

/* The object library. len: the drawing's unit as a share of the grid's width. free bodies sit centered at (0.3, 0.5)
   of the box; ground bodies stand on the floor with x = 0 at 0.2 of the width. ref: 'h' frontal height or 'c' chord. */
function racerParts(rw, flap) { // the generic modern open-wheel racer; rw, flap: rear wing angles (degrees)
  var body = chaikin([[0.03, 0.06, 1], [0.035, 0.075], [0.12, 0.088], [0.25, 0.105], [0.33, 0.12], [0.37, 0.148, 1], [0.43, 0.155], [0.47, 0.18, 1], [0.52, 0.18],
    [0.6, 0.152], [0.72, 0.13], [0.84, 0.112], [0.9, 0.102, 1], [0.92, 0.08, 1], [0.94, 0.075, 1], [0.88, 0.058], [0.8, 0.045, 1], [0.31, 0.045, 1], [0.27, 0.062], [0.15, 0.066], [0.06, 0.058, 1]], 2);
  var main = invWing(0.86, 0.235, 0.075, rw, 0.05, 0.13), te = main[14];
  var fl = invWing(te[0] - 0.012, te[1] + 0.012, 0.042, rw + flap, 0.05, 0.13);
  return [body, invWing(0.0, 0.04, 0.085, 4, 0.06, 0.12), main, fl];
}
var LIB = {
  ball: { name: 'Ball (circle)', cat: 'shapes', len: 0.11, ref: 'h', range: [-45, 45], a0: 0, parts: function () { return [circlePts(0, 0, 0.5, 64)]; } },
  square: { name: 'Square', cat: 'shapes', len: 0.1, ref: 'h', range: [-45, 45], a0: 0, parts: function () { return [[[-0.5, -0.5, 1], [0.5, -0.5, 1], [0.5, 0.5, 1], [-0.5, 0.5, 1]]]; } },
  plate: { name: 'Flat plate', cat: 'shapes', len: 0.12, ref: 'h', range: [-90, 90], a0: 90, parts: function () { return [[[-0.5, -0.03, 1], [0.5, -0.03, 1], [0.5, 0.03, 1], [-0.5, 0.03, 1]]]; } },
  half: { name: 'Half-cylinder', cat: 'shapes', len: 0.11, ref: 'h', range: [-180, 180], a0: 0, parts: function () { var p = []; for (var i = 0; i <= 32; i++) { var a = Math.PI / 2 + Math.PI * i / 32; p.push([0.25 + 0.5 * Math.cos(a), 0.5 * Math.sin(a), i === 0 || i === 32 ? 1 : 0]); } return [p]; } },
  tear: { name: 'Teardrop', cat: 'shapes', len: 0.3, ref: 'h', range: [-30, 30], a0: 0, parts: function () { return [xform(nacaPts(0, 0, 0.36, 40), -0.5, 0, 1, 0)]; } },
  r50: { name: '1950s front-engine racer', cat: 'cars', len: 0.58, x0: 0.13, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.18, 0.09, 0.09], [0.77, 0.09, 0.09]],
    parts: function () { return [chaikin([[0, 0.1], [0.01, 0.135], [0.1, 0.155], [0.45, 0.165], [0.55, 0.17], [0.6, 0.215], [0.67, 0.215], [0.72, 0.17], [0.85, 0.15], [1, 0.115, 1], [0.92, 0.075], [0.7, 0.055], [0.2, 0.055], [0.04, 0.07]], 2)]; } },
  r70: { name: '1970s wedge racer with wings', cat: 'cars', len: 0.58, x0: 0.13, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.17, 0.07, 0.07], [0.79, 0.085, 0.085]], struts: [[0.9, 0.1, 0.9, 0.235]],
    parts: function () {
      return [chaikin([[0, 0.035, 1], [0.38, 0.115], [0.42, 0.145], [0.47, 0.16], [0.5, 0.205, 1], [0.57, 0.205, 1], [0.6, 0.14], [0.8, 0.12], [0.88, 0.1, 1], [0.88, 0.032, 1], [0.04, 0.032, 1]], 2),
        invWing(0.84, 0.24, 0.11, 12, 0.06, 0.12), invWing(0.03, 0.06, 0.08, 6, 0.05, 0.12)];
    } },
  rnow: { name: 'Modern open-wheel racer', cat: 'cars', len: 0.58, x0: 0.13, ref: 'h', ground: 1, range: [-1, 1], a0: 0, wheels: [[0.17, 0.065, 0.065], [0.8, 0.065, 0.065]], struts: [[0.93, 0.09, 0.91, 0.24]],
    parts: function (o) { return racerParts(o && o.rw != null ? o.rw : 30, o && o.flap != null ? o.flap : 20); } },
  sedan: { name: 'Sedan', cat: 'cars', len: 0.5, x0: 0.15, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.18, 0.07, 0.07], [0.8, 0.07, 0.07]],
    parts: function () { return [chaikin([[0, 0.1], [0.01, 0.16], [0.05, 0.175], [0.27, 0.19], [0.33, 0.2], [0.46, 0.29], [0.7, 0.29], [0.82, 0.215], [0.97, 0.21], [1, 0.18], [0.99, 0.08], [0.94, 0.045], [0.06, 0.04], [0.01, 0.06]], 2)]; } },
  hatch: { name: 'Hatchback', cat: 'cars', len: 0.44, x0: 0.17, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.17, 0.075, 0.075], [0.82, 0.075, 0.075]],
    parts: function () { return [chaikin([[0, 0.1], [0.01, 0.17], [0.22, 0.21], [0.27, 0.22], [0.47, 0.355], [0.88, 0.35], [0.96, 0.33], [0.985, 0.25, 1], [1, 0.1], [0.97, 0.05], [0.05, 0.045], [0.01, 0.06]], 2)]; } },
  van: { name: 'Van or SUV', cat: 'cars', len: 0.5, x0: 0.15, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.17, 0.08, 0.08], [0.8, 0.08, 0.08]],
    parts: function () { return [chaikin([[0, 0.08], [0.01, 0.22], [0.1, 0.255], [0.2, 0.27], [0.33, 0.4], [0.96, 0.4], [1, 0.37], [1, 0.07, 1], [0.96, 0.05], [0.04, 0.05], [0, 0.06]], 2)]; } },
  pickup: { name: 'Pickup truck', cat: 'cars', len: 0.5, x0: 0.15, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.16, 0.08, 0.08], [0.8, 0.08, 0.08]],
    parts: function () { return [chaikin([[0, 0.09], [0.01, 0.2], [0.25, 0.22], [0.3, 0.23], [0.39, 0.34], [0.585, 0.34], [0.6, 0.33, 1], [0.6, 0.15, 1], [0.965, 0.15, 1], [0.965, 0.22, 1], [0.985, 0.22, 1], [0.99, 0.07, 1], [0.95, 0.05], [0.04, 0.05], [0, 0.06]], 2)]; } },
  stream: { name: 'Streamlined car (teardrop)', cat: 'cars', len: 0.5, x0: 0.15, ref: 'h', ground: 1, range: [-2, 2], a0: 0, wheels: [[0.2, 0.06, 0.06], [0.75, 0.06, 0.06]],
    parts: function () { return [outline(function (s) { return 0.045 + 2 * thick(s, 0.2) * 0.95; }, function (s) { return 0.045 + Math.min(0.02, thick(s, 0.2) * 0.5); }, 40)]; } },
  penguin: { name: 'Penguin, swimming', cat: 'animals', len: 0.28, ref: 'h', range: [-30, 30], a0: 0,
    parts: function () { return [xform(outline(function (s) { return thick(s, 0.32) * 1.0; }, function (s) { return -thick(s, 0.32) * 0.9; }, 36), -0.5, 0, 1, 0), [[-0.56, 0.01, 1], [-0.47, 0.035], [-0.47, -0.02]], [[0.45, 0.012], [0.56, 0.0, 1], [0.45, -0.015]]]; } },
  dolphin: { name: 'Dolphin', cat: 'animals', len: 0.32, ref: 'h', range: [-30, 30], a0: 0,
    parts: function () {
      var b = outline(function (s) { return s < 0.86 ? thick(s / 0.86, 0.24) * 0.86 * 1.05 + 0.005 : 0.007; }, function (s) { return s < 0.86 ? -thick(s / 0.86, 0.24) * 0.86 * 0.85 - 0.005 : -0.007; }, 40);
      return [xform(b, -0.44, 0, 0.94, 0), [[-0.5, 0.0, 1], [-0.41, 0.03], [-0.41, -0.025]], [[-0.07, 0.09], [0.04, 0.19, 1], [0.08, 0.07]], [[0.42, 0.014], [0.53, 0.007, 1], [0.53, -0.007, 1], [0.42, -0.014]]];
    } },
  falcon: { name: 'Falcon in a dive', cat: 'animals', len: 0.26, ref: 'h', range: [-20, 20], a0: 0,
    parts: function () { return [xform(outline(function (s) { return thick(s, 0.3) * 1.1; }, function (s) { return -thick(s, 0.3) * 0.85; }, 36), -0.45, 0, 0.9, 0), [[-0.5, 0.01, 1], [-0.43, 0.04], [-0.42, -0.02]], [[0.4, 0.015], [0.55, 0.005, 1], [0.4, -0.012]]]; } },
  trout: { name: 'Trout', cat: 'animals', len: 0.3, ref: 'h', range: [-30, 30], a0: 0,
    parts: function () {
      var b = outline(function (s) { return s < 0.84 ? thick(s / 0.84, 0.22) * 0.84 + 0.008 : 0.012; }, function (s) { return s < 0.84 ? -thick(s / 0.84, 0.22) * 0.84 * 0.95 - 0.008 : -0.012; }, 40);
      return [xform(b, -0.5, 0, 0.9, 0), [[-0.15, 0.08], [-0.05, 0.14, 1], [0.02, 0.07]], [[0.18, -0.05], [0.24, -0.1, 1], [0.27, -0.04]], [[0.3, 0.0, 1], [0.5, 0.11, 1], [0.44, 0.0, 1], [0.5, -0.11, 1]]];
    } },
  bwing: { name: 'Bird wing section', cat: 'animals', len: 0.26, ref: 'c', range: [-10, 25], a0: 5, parts: function () { return [xform(nacaPts(0.07, 0.35, 0.06, 30), -0.5, 0, 1, 0)]; } },
  cyclist: { name: 'Cyclist in a tuck', cat: 'animals', len: 0.3, ref: 'h', ground: 1, range: [-5, 5], a0: 0, person: 1, wheels: [[0.2, 0.19, 0.19], [0.8, 0.19, 0.19]],
    parts: function () {
      return [circlePts(0.29, 0.645, 0.05, 24), chaikin([[0.27, 0.6], [0.3, 0.665], [0.38, 0.69], [0.5, 0.67], [0.68, 0.64], [0.74, 0.6], [0.7, 0.54], [0.5, 0.55], [0.38, 0.56], [0.31, 0.56]], 2),
        chaikin([[0.36, 0.59], [0.22, 0.53, 1], [0.24, 0.51, 1], [0.37, 0.55]], 1), chaikin([[0.7, 0.6], [0.58, 0.42, 1], [0.5, 0.22, 1], [0.54, 0.21, 1], [0.6, 0.4], [0.72, 0.55]], 1)];
    } },
  building: { name: 'Tall building', cat: 'other', len: 0.17, ref: 'h', ground: 1, still: 1, range: [0, 0], a0: 0, x0: 0.3, parts: function () { return [[[0, 0, 1], [0.45, 0, 1], [0.45, 1, 1], [0, 1, 1]]]; } },
  bridge: { name: 'Bridge deck', cat: 'other', len: 0.4, ref: 'h', range: [-10, 10], a0: 0, parts: function () { return [[[-0.5, 0.02, 1], [-0.42, 0.06, 1], [0.42, 0.06, 1], [0.5, 0.02, 1], [0.35, -0.06, 1], [-0.35, -0.06, 1]]]; } },
  golf: { name: 'Dimpled ball', cat: 'other', len: 0.11, ref: 'h', range: [-45, 45], a0: 0, parts: function () { return [circlePts(0, 0, 0.5, 144, 18)]; } }
};
/* place a library body in a grid: returns polygons in grid cells (x right, y down), wheels, struts, and sizes */
function placeBody(o, nx, ny, deg, opts) {
  var Lc = o.len * nx, parts = o.parts(opts), K = Math, a = -deg * K.PI / 180, c = K.cos(a), s = K.sin(a);
  var gx = o.ground ? (o.x0 || 0.2) * nx : 0.3 * nx, gy = o.ground ? ny - 1 : 0.5 * ny, piv = o.ground ? [0.5, 0.1] : [0, 0];
  function T(p) { var x = p[0] - piv[0], y = p[1] - piv[1], X = piv[0] + x * c - y * s, Y = piv[1] + x * s + y * c; return [gx + X * Lc, gy - Y * Lc]; }
  var polys = parts.map(function (P) { return P.map(T); }), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, bx0 = 1e9, bx1 = -1e9;
  polys.forEach(function (P) { P.forEach(function (q) { x0 = K.min(x0, q[0]); x1 = K.max(x1, q[0]); y0 = K.min(y0, q[1]); y1 = K.max(y1, q[1]); }); });
  parts.forEach(function (P) { P.forEach(function (q) { bx0 = K.min(bx0, q[0]); bx1 = K.max(bx1, q[0]); }); });
  var wheels = (o.wheels || []).map(function (w) { var p = T(w); return [p[0], p[1], w[2] * Lc]; });
  var struts = (o.struts || []).map(function (w) { return T([w[0], w[1]]).concat(T([w[2], w[3]])); });
  var length = (bx1 - bx0) * Lc, ref = o.ref === 'c' ? length : (y1 - y0);
  return { polys: polys, box: [x0, y0, x1, y1], wheels: wheels, struts: struts, length: length, ref: ref, Lc: Lc };
}
function pip(P, X, Y) {
  var c = false, m = P.length;
  for (var i = 0, j = m - 1; i < m; j = i++) { var a = P[i], b = P[j]; if ((a[1] > Y) !== (b[1] > Y) && X < (b[0] - a[0]) * (Y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; }
  return c;
}
/* thin parts (under 4 cells across) are also tested a third of a cell around the center, so they leave no holes */
function inPolys(polys, box, X, Y, thin) {
  if (X < box[0] - 1 || X > box[2] + 1 || Y < box[1] - 1 || Y > box[3] + 1) return false;
  for (var n = 0; n < polys.length; n++) {
    var P = polys[n];
    if (pip(P, X, Y)) return true;
    if (thin && thin[n] && (pip(P, X - 0.35, Y) || pip(P, X + 0.35, Y) || pip(P, X, Y - 0.35) || pip(P, X, Y + 0.35))) return true;
  }
  return false;
}
function thinOf(polys) {
  return polys.map(function (P) {
    var A = 0, L = 0;
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) { A += (P[j][0] - P[i][0]) * (P[j][1] + P[i][1]) / 2; L += Math.hypot(P[j][0] - P[i][0], P[j][1] - P[i][1]); }
    return 2 * Math.abs(A) / Math.max(1e-9, L) * 2 < 4; // twice area/perimeter ~ the mean thickness
  });
}
function maskOf(pb) { var th = thinOf(pb.polys); return function (i, j) { return inPolys(pb.polys, pb.box, i + 0.5, j + 0.5, th); }; }
/* Shape Lab bodies: a smooth closed curve (Catmull–Rom) through control points, in units of D, the diameter of the
   circle with the same area; kept at that area (area pi/4), centered on its centroid. */
function splinePts(c, per) {
  var out = [], n = c.length;
  for (var i = 0; i < n; i++) {
    var p0 = c[(i + n - 1) % n], p1 = c[i], p2 = c[(i + 1) % n], p3 = c[(i + 2) % n];
    for (var s = 0; s < per; s++) {
      var t = s / per, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (p2[0] - p0[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (3 * p1[0] - p0[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (p2[1] - p0[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (3 * p1[1] - p0[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  return out;
}
function areaCen(P) {
  var A = 0, cx = 0, cy = 0;
  for (var i = 0, j = P.length - 1; i < P.length; j = i++) { var w = P[j][0] * P[i][1] - P[i][0] * P[j][1]; A += w; cx += (P[j][0] + P[i][0]) * w; cy += (P[j][1] + P[i][1]) * w; }
  A /= 2; return { A: A, x: cx / (6 * A), y: cy / (6 * A) };
}
function simple(P) {
  var n = P.length;
  function cross(a, b, c) { return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]); }
  for (var i = 0; i < n; i++) {
    var a = P[i], b = P[(i + 1) % n];
    for (var j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      var c = P[j], d = P[(j + 1) % n];
      if (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) return false;
    }
  }
  return true;
}
var LAB_W = 3.2, LAB_H = 1.6;
/* the rule: same area, no crossing, fits the test box; returns the fixed-up control points or null */
function labFix(ctrl) {
  var P = splinePts(ctrl, 10), q = areaCen(P);
  if (!(q.A > 0.05)) return null;
  var k = Math.sqrt(Math.PI / 4 / q.A), out = ctrl.map(function (p) { return [(p[0] - q.x) * k, (p[1] - q.y) * k]; });
  P = splinePts(out, 10);
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  P.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  if (x1 - x0 > LAB_W || y1 - y0 > LAB_H || !simple(P)) return null;
  return out;
}
function labCircle(n) { var c = []; for (var i = 0; i < n; i++) { var a = Math.PI - 2 * Math.PI * i / n; c.push([0.5 * Math.cos(a), -0.5 * Math.sin(a)]); } return labFix(c) || c; }

/* Drawing shared by the two new scenes: the flow as a colored image, the body, the ground, force arrows. */
function nsHex(h) { var v = parseInt(h.slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; }
function painter() {
  var oc = null, img = null, lut = null, key = '';
  function rebuild(view, col) {
    var ends = { p: [col.blue, col.red], s: [col.orange, col.teal], w: [col.purple, col.gold] }[view], bg = nsHex(col.bg), A = nsHex(ends[0]), B = nsHex(ends[1]);
    lut = new Uint8ClampedArray(256 * 3);
    for (var n = 0; n < 256; n++) { var t = n / 127.5 - 1, e = t < 0 ? A : B, w = Math.min(1, Math.pow(Math.abs(t), 0.8)); for (var q = 0; q < 3; q++) lut[n * 3 + q] = bg[q] + (e[q] - bg[q]) * w; }
  }
  var paint = function (x, F, X, Y, W, H, view, smoke, col) {
    var nx = F.nx, ny = F.ny;
    if (!oc || oc.width !== nx || oc.height !== ny) { oc = document.createElement('canvas'); oc.width = nx; oc.height = ny; img = oc.getContext('2d').createImageData(nx, ny); }
    if (view + col.bg !== key) { rebuild(view, col); key = view + col.bg; }
    var d = img.data, ink = nsHex(col.ink), cp = 1 / (1.5 * F.U * F.U), U = F.U, rho = F.rho, ux = F.ux, uy = F.uy, sm = F.sm, so = F.solid, k, i, j;
    for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) {
      k = j * nx + i; var o = k * 4, v = 0, jj = j < 1 ? 1 : j > ny - 2 ? ny - 2 : j, kk = jj * nx + i;
      if (!so[k] && !so[kk]) {
        k = kk;
        if (view === 'p') v = (rho[k] - rho[2 * nx + i]) * cp;
        else if (view === 's') v = (Math.sqrt(ux[k] * ux[k] + uy[k] * uy[k]) / U - 1) * 1.6;
        else if (i > 0 && i < nx - 1) v = ((uy[k + 1] - uy[k - 1]) - (ux[k + nx] - ux[k - nx])) / U * 2;
        k = j * nx + i;
      }
      var n = Math.max(0, Math.min(255, (v + 1) * 127.5 | 0)) * 3, s = smoke && !so[k] ? Math.min(1, sm[k] * 1.5) * 0.55 : 0;
      for (var q = 0; q < 3; q++) d[o + q] = lut[n + q] + (ink[q] - lut[n + q]) * s;
      d[o + 3] = 255;
    }
    oc.getContext('2d').putImageData(img, 0, 0);
    x.imageSmoothingEnabled = true; x.drawImage(oc, X, Y, W, H);
  };
  paint.swatch = function (n) { return 'rgb(' + [].slice.call(lut, n * 765, n * 765 + 3) + ')'; };
  return paint;
}
/* T(gx, gy) -> [screen x, y]; s = screen px per cell */
function drawGround(x, F, T, s, col, w) {
  var y = T(0, F.ny - 1)[1], x0 = T(0, 0)[0];
  x.fillStyle = col.grid; x.fillRect(x0, y, w, s * 1.5 + 6);
  x.strokeStyle = col.axis; x.lineWidth = 1.5; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + w, y); x.stroke();
  x.strokeStyle = col.muted; x.lineWidth = 2; x.setLineDash([10, 14]); x.lineDashOffset = F.rolling ? -(F.t * F.U * s) % 24 : 0;
  x.beginPath(); x.moveTo(x0, y + 4); x.lineTo(x0 + w, y + 4); x.stroke(); x.setLineDash([]); x.lineDashOffset = 0;
}
function drawBody(x, pb, T, s, col, person) {
  x.lineJoin = 'round';
  (pb.struts || []).forEach(function (q) { var a = T(q[0], q[1]), b = T(q[2], q[3]); x.strokeStyle = col.ink; x.lineWidth = 2; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); });
  pb.polys.forEach(function (P) {
    x.beginPath(); P.forEach(function (p, i) { var q = T(p[0], p[1]); if (i) x.lineTo(q[0], q[1]); else x.moveTo(q[0], q[1]); }); x.closePath();
    x.fillStyle = person ? '#454b48' : col.panel; x.fill(); x.lineWidth = 1.5; x.strokeStyle = col.ink; x.stroke();
  });
  (pb.wheels || []).forEach(function (w) { var q = T(w[0], w[1]); x.strokeStyle = col.muted; x.lineWidth = 1.5; x.setLineDash([4, 4]); x.beginPath(); x.arc(q[0], q[1], w[2] * s, 0, 7); x.stroke(); x.setLineDash([]); });
}
function nsArrow(x, a, b, e, h, color, label) {
  var l = Math.hypot(e - a, h - b); if (l < 6) return;
  var p = (e - a) / l, q = (h - b) / l; x.strokeStyle = x.fillStyle = color; x.lineWidth = 3;
  x.beginPath(); x.moveTo(a, b); x.lineTo(e - p * 8, h - q * 8); x.stroke();
  x.beginPath(); x.moveTo(e, h); x.lineTo(e - p * 11 - q * 6, h - q * 11 + p * 6); x.lineTo(e - p * 11 + q * 6, h - q * 11 - p * 6); x.fill();
  x.font = 'bold 13px system-ui,sans-serif'; x.textAlign = 'left'; x.fillText(label, e + (q ? 7 : -12), h + (q ? 4 : 18));
}
function nsKey(x, X, Y, lab, col, paint) {
  x.font = '12px system-ui,sans-serif'; x.textAlign = 'left';
  var w0 = x.measureText(lab[0]).width; x.fillStyle = col.a(col.bg, 0.8); x.fillRect(X - 4, Y - 14, w0 + x.measureText(lab[1]).width + 72, 20);
  for (var n = 0; n < 2; n++) { x.fillStyle = paint.swatch(n); x.fillRect(X, Y - 9, 12, 10); x.fillStyle = col.ink; x.fillText(lab[n], X + 16, Y); X += w0 + 30; }
}
var NS_KEYLAB = { p: ['low pressure', 'high pressure'], s: ['slower', 'faster'], w: ['spins counterclockwise', 'clockwise'] };
function heightOf(polys) { var a = 1e9, b = -1e9; polys.forEach(function (P) { P.forEach(function (p) { a = Math.min(a, p[1]); b = Math.max(b, p[1]); }); }); return b - a; }
/* the reference length for coefficients: the chord for wing sections; otherwise the frontal height at the starting
   angle (for cars, of the body alone, so moving a wing doesn't change the yardstick) */
function refOf(o, nx, ny, opts) { var p0 = placeBody(o, nx, ny, o.a0, opts); return o.ref === 'c' ? p0.length : heightOf(o.cat === 'cars' ? [p0.polys[0]] : p0.polys); }
function lineChart(x, W, H, series, col, o) { // series: [{v: [...], color, label}], o: {lo, hi, zero, xlab}
  x.fillStyle = col.bg; x.fillRect(0, 0, W, H);
  var L = 40, R = W - 10, Tp = 24, B = H - 18, lo = o.lo, hi = o.hi, i, n;
  series.forEach(function (s) { s.v.forEach(function (v, i) { if (v === v && (s.dots || i >= s.v.length / 2)) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }); });
  var pad = (hi - lo) * 0.08 || 0.1; lo -= pad; hi += pad;
  function Y(v) { return B - (v - lo) / (hi - lo) * (B - Tp); }
  x.font = '11px system-ui,sans-serif'; x.textAlign = 'right'; x.fillStyle = col.muted; x.strokeStyle = col.grid; x.lineWidth = 1;
  var step = Math.pow(10, Math.floor(Math.log(hi - lo) / Math.LN10)); if ((hi - lo) / step < 3) step /= 2;
  for (var t = Math.ceil(lo / step) * step; t <= hi; t += step) { var y = Y(t); x.beginPath(); x.moveTo(L, y); x.lineTo(R, y); x.stroke(); x.fillText(Gallery.fmt(t, step < 1 ? 1 : 0), L - 5, y + 4); }
  if (lo < 0 && hi > 0) { x.strokeStyle = col.axis; x.beginPath(); x.moveTo(L, Y(0)); x.lineTo(R, Y(0)); x.stroke(); }
  x.save(); x.beginPath(); x.rect(L - 8, Tp - 8, R - L + 16, B - Tp + 16); x.clip();
  series.forEach(function (s) {
    n = s.v.length; if (!n) return;
    x.strokeStyle = x.fillStyle = s.color; x.lineWidth = 2;
    if (s.dots) { for (i = 0; i < n; i++) { var px = s.xs ? L + (s.xs[i] - o.x0) / (o.x1 - o.x0) * (R - L) : L + (i + 0.5) / Math.max(n, o.n || 8) * (R - L); x.beginPath(); x.arc(px, Y(s.v[i]), s.big === i ? 6 : 3.5, 0, 7); x.fill(); } return; }
    x.beginPath(); for (i = 0; i < n; i++) { var qx = L + i / Math.max(1, (o.n || n) - 1) * (R - L); if (i) x.lineTo(qx, Y(s.v[i])); else x.moveTo(qx, Y(s.v[i])); } x.stroke();
  });
  x.restore();
  x.textAlign = 'left'; x.font = '600 11px system-ui,sans-serif'; var lx = L;
  series.forEach(function (s) { if (!s.label) return; x.fillStyle = s.color; x.fillRect(lx, 8, 10, 3); x.fillStyle = col.ink; x.fillText(s.label, lx + 14, 14); lx += x.measureText(s.label).width + 30; });
  if (o.xlab) { x.fillStyle = col.muted; x.font = '11px system-ui,sans-serif'; x.textAlign = 'right'; x.fillText(o.xlab, R, H - 4); }
}

/* Scene: shapes, cars, animals and other things in the wind. */
function shapesScene(g, statsBox) {
  var K = Math, CATS = [['shapes', 'Shapes'], ['cars', 'Cars'], ['animals', 'Animals and people'], ['other', 'Other']];
  var c = g.canvas({ aspect: 0.5, max: 460, min: 200, label: 'Air flows left to right past the chosen object. Colors show pressure; smoke streaks show the paths the air takes; arrows show drag and lift.' });
  var cc = g.canvas({ aspect: 0.2, max: 130, min: 104, label: 'A live chart of the drag coefficient and the lift coefficient over time. Below zero, lift is downforce.' });
  cc.el.style.marginTop = '4px';
  var F = Flow(), paint = painter(), P = { cat: 'shapes', id: 'ball', a: 0, s: 1, rolling: true, view: 'p', smoke: true };
  var o, pb, ref = 1, len0 = 1, nx = 160, ny = 80, spf = 4, hist = { d: [], l: [] }, HN = 240;
  function ids(cat) { return Object.keys(LIB).filter(function (k) { return LIB[k].cat === cat; }); }
  function nu() { return K.max(0.01, 0.012 * nx / 240); }
  function init() {
    nx = K.max(160, K.min(240, K.round(c.w / 3))); ny = K.round(nx * c.h / c.w); o = LIB[P.id];
    F.init(nx, ny, 0.1 * P.s, nu(), o.ground); F.rolling = !!(o.ground && !o.still && P.rolling);
    hist = { d: [], l: [] }; place();
  }
  function place() {
    pb = placeBody(o, nx, ny, P.a); ref = refOf(o, nx, ny); len0 = placeBody(o, nx, ny, o.a0).length; F.setBody(maskOf(pb));
  }
  function run(n) {
    for (var q = 0; q < n; q++) { F.step(); if (F.t % 10 === 0) { var C = F.coef(ref); hist.d.push(C.cd); hist.l.push(C.cl); if (hist.d.length > HN) { hist.d.shift(); hist.l.shift(); } } }
    if (!F.sane()) { P.s = K.max(0.4, K.round(P.s * 10 - 2) / 10); spS.set(P.s * 100); init(); g.say('The flow became unstable; it restarted at a lower wind speed.'); }
  }
  var busy = 0;
  function settle(n) { var id = ++busy; (function go() { if (id !== busy) return; run(K.min(n, 30)); n -= 30; if (n > 0) requestAnimationFrame(go); else g.redraw(); })(); }
  var Lp = g.loop(function (dt) {
    if (dt >= 1) { run(60); g.redraw(); return; }
    var t0 = performance.now(); run(spf); var ms = performance.now() - t0;
    if (ms < 7 && spf < 20) spf++; else if (ms > 12 && spf > 1) spf--;
    g.redraw();
  }, { auto: false, stepSize: 1, stepText: 'Step ahead' });
  function reflow() { if (!Lp.playing()) settle(1200); g.redraw(); }

  g.draw(function (col) {
    var x = c.ctx, s = c.w / nx;
    function T(X, Y) { return [X * s, Y * s]; }
    paint(x, F, 0, 0, c.w, c.h, P.view, P.smoke, col);
    if (o.ground) drawGround(x, F, T, s, col, c.w);
    drawBody(x, pb, T, s, col, o.person);
    var C = F.coef(ref), bx = (pb.box[0] + pb.box[2]) / 2 * s, by = (pb.box[1] + pb.box[3]) / 2 * s, Z = c.h * 0.32, Ls = ref * s * 0.9;
    var lv = K.max(-Z, K.min(Z, C.cl * Ls)), dv = K.max(-Z, K.min(Z * 1.4, C.cd * Ls));
    if (o.ground) { // above the body, so a downforce arrow ends on its roof instead of in the floor
      by = pb.box[1] * s - 10; Z = K.min(Z, by - 20); lv = K.max(-Z, K.min(Z, lv));
      if (lv < 0) nsArrow(x, bx, by + lv, bx, by, col.green, 'downforce'); else nsArrow(x, bx, by, bx, by - lv, col.green, 'lift');
    } else nsArrow(x, bx, by, bx, by - lv, col.green, C.cl >= 0 ? 'lift' : 'downforce');
    nsArrow(x, bx, by, bx + dv, by, col.gold, 'drag');
    x.font = '13px system-ui,sans-serif'; x.fillStyle = col.ink; x.textAlign = 'left'; x.fillText('wind →', 8, 18);
    nsKey(x, 8, o.ground ? 34 : c.h - 10, NS_KEYLAB[P.view], col, paint);
    var Re = F.U * len0 / nu(), down = C.cl < 0;
    st.innerHTML = o.name + ' · Reynolds number <b>' + g.fmt(K.round(Re / 10) * 10) + '</b> · drag coefficient <b>' + g.fmt(C.cd, 2) + '</b> · ' + (down ? 'downforce' : 'lift') +
      ' coefficient <b>' + g.fmt(K.abs(C.cl), 2) + '</b>' + (K.abs(C.cl) > 0.05 && C.cd > 0.01 && K.abs(C.cl / C.cd) >= 0.1 ? ' · ' + (down ? 'downforce' : 'lift') + ' ÷ drag <b>' + g.fmt(K.abs(C.cl / C.cd), 1) + '</b>' : '') +
      ' <span style="white-space:nowrap">(per unit width, using the ' + (o.ref === 'c' ? 'chord' : 'height facing the wind') + ')</span>';
    lineChart(cc.ctx, cc.w, cc.h, [{ v: hist.d, color: col.gold, label: 'drag' }, { v: hist.l, color: col.green, label: 'lift (below 0: downforce)' }], col, { lo: 0, hi: 0.5, n: HN, xlab: 'time →' });
  });

  var row = g.group();
  var catS = g.select({ parent: row, label: 'Group', value: P.cat, options: CATS, change: function (v) { P.cat = v; fillObjects(); pick(ids(v)[0]); } });
  var objS = g.select({ parent: row, label: 'Object', value: P.id, options: [], change: function (v) { pick(v); } });
  function fillObjects() { objS.innerHTML = ''; ids(P.cat).forEach(function (k) { var op = document.createElement('option'); op.value = k; op.textContent = LIB[k].name; objS.appendChild(op); }); }
  var row2 = g.group();
  var anS = g.slider({ parent: row2, label: 'Angle', min: -45, max: 45, value: 0, fmt: function (v) { return v + '°'; }, input: function (v) { P.a = v; place(); reflow(); } });
  var spS = g.slider({ parent: row2, label: 'Wind speed', min: 40, max: 120, step: 10, value: 100, fmt: function (v) { return v + '%'; }, input: function (v) { P.s = v / 100; F.U = 0.1 * P.s; reflow(); } });
  var row3 = g.group();
  var rollT = g.toggle('Rolling road (the floor moves with the wind)', true, function (v) { P.rolling = v; F.rolling = !!(o.ground && !o.still && v); reflow(); g.say(v ? 'Rolling road: the floor moves at the wind speed, as a real road does under a moving car.' : 'Still floor: air next to the floor is held back.'); }, { parent: row3 });
  g.select({ parent: row3, label: 'Color shows', value: 'p', options: [['p', 'pressure'], ['s', 'speed'], ['w', 'swirl']], change: function (v) { P.view = v; g.redraw(); } });
  g.toggle('Smoke', true, function (v) { P.smoke = v; g.redraw(); }, { parent: row3 });
  g.button('↺ Restart flow', function () { init(); reflow(); g.say('The flow restarted.'); }, { parent: row3 });
  var note = g.el('p', 'gx-hint'); g.bar.appendChild(note);
  var NOTES = {
    plate: 'It starts broadside, square to the wind. Turn it toward 0° to slice the air edge-on.',
    half: 'Curved side first. Turn it to 180° to face the flat side into the wind.',
    tear: 'Round nose, long tapering tail.',
    rnow: 'Our own generic drawing from general proportions, not any real team\'s car.',
    r70: 'Wings arrived on racing cars in the late 1960s.',
    bwing: 'A thin, strongly curved section, like a slice through a bird\'s wing. Tilt it with the angle slider.',
    cyclist: 'Wheels are drawn but left out of the flow.',
    building: 'Wind meets a tall building. Watch the big swirl behind it. The ground here stays still: a building doesn\'t move.',
    bridge: 'Since a bridge twisted itself apart in the wind in 1940, engineers test deck shapes in wind tunnels.',
    golf: 'On a real golf ball, dimples help only at the ball\'s real speeds. See "Why shape matters" below.'
  };
  function pick(id) {
    P.id = id; objS.value = id; o = LIB[id]; P.a = o.a0;
    anS.input.min = o.range[0]; anS.input.max = o.range[1]; anS.set(P.a); anS.input.disabled = o.range[0] === o.range[1];
    rollT.disabled = !o.ground || !!o.still; rollT.parentNode.style.opacity = o.ground && !o.still ? '' : '0.5';
    note.textContent = (NOTES[id] ? NOTES[id] + ' ' : '') + (o.cat === 'cars' ? 'Wheels are drawn but left out of the flow: in a flat slice they would wall off the air under the car. Ride heights are a little higher than real so air can pass under on our coarse grid.' : '');
    init(); reflow(); g.say(o.name + '.');
  }
  var st = g.out('', { parent: statsBox });
  var honest = g.el('p', 'gx-hint', 'A 2D model at a low Reynolds number (about 100 to 1,400 here, by the object\'s length; a real car on the highway is in the millions). It shows the patterns, such as the size of the wake, swirls shed by turns, and stall, and which shapes rank better. The numbers are not real-world values, and real cars and animals are 3D.');
  honest.style.borderLeft = '3px solid #b8963e'; honest.style.paddingLeft = '.6rem'; g.bar.appendChild(honest);
  var st;
  var d0 = null;
  function tilt(a, say) { a = K.max(o.range[0], K.min(o.range[1], K.round(a))); if (a !== P.a) { P.a = a; anS.set(a); place(); reflow(); if (say) g.say('Angle ' + a + ' degrees.'); } }
  g.drag(c.el, { touch: 'pan-y', down: function (X, Y) { d0 = [Y, P.a]; }, move: function (X, Y) { if (d0) tilt(d0[1] - (Y - d0[0]) / 4); }, up: function () { if (d0) g.say('Angle ' + P.a + ' degrees.'); d0 = null; } });
  g.keys(c.el, { ArrowUp: function () { tilt(P.a + 1, 1); }, ArrowDown: function () { tilt(P.a - 1, 1); } });
  c.onresize = function () { if (o) { init(); reflow(); } };
  cc.onresize = function () { g.redraw(); };
  fillObjects(); o = LIB[P.id]; pick(P.id);
  var first = true, was = false;
  return {
    show: function () { c.fit(); cc.fit(); if (first) { first = false; if (!g.reduced) Lp.play(); else settle(1500); } else if (was) Lp.play(); g.redraw(); },
    hide: function () { was = Lp.playing(); Lp.pause(); busy++; }
  };
}

/* Scene: Shape Lab, five challenges. Every trial runs the same fixed number of steps from the same start on a grid
   of fixed size, and averages the forces over its second half, so a score depends only on the design. */
function labScene(g, statsBox) {
  var K = Math, LS = 'trb.shapelab.v1', BUDGET = 3.9;
  var lo = { aspect: 0.5, max: 460, label: 'Shape Lab test section: air flows left to right past your design.' };
  Object.defineProperty(lo, 'min', { get: function () { return (g.stage.clientWidth || 300) < 600 ? 260 : 200; } });
  var c = g.canvas(lo);
  var cc = g.canvas({ aspect: 0.22, max: 150, min: 112, label: 'Your trial results.' });
  cc.el.style.marginTop = '4px';
  c.el.tabIndex = 0;
  var F = Flow(), paint = painter(), view = 'p', smoke = true;
  var CH = {
    drag: { name: 'Least drag: shape a body', grid: [200, 100], steps: 4000,
      goal: 'Drag the gold points to reshape the body, then run a trial. Its area stays the same and the curve may not cross itself, so it can\'t win by shrinking. Lower drag is better. A circle scores about 1.5.' },
    down: { name: 'Downforce on a drag budget', grid: [240, 120], steps: 5000,
      goal: 'Set the rear wing and its flap on our generic racing car (rolling road on). Get the most downforce while the drag coefficient stays at ' + Gallery.fmt(BUDGET, 1) + ' or less. Steeper settings push down harder, but they also cost drag.' },
    glide: { name: 'Best glide angle', grid: [200, 100], steps: 4000,
      goal: 'A gliding bird wants the most lift for the least drag. Pick an angle for the wing section, run a trial, and find the angle with the best lift ÷ drag.' },
    race: { name: 'Penguin, ball or teardrop?', grid: [200, 100], steps: 4000,
      goal: 'Three bodies with the same area (the same amount of body). Rank them from least drag to most, then test all three. One point for each one in the right place.' },
    road: { name: 'Rolling road or still floor?', grid: [240, 120], steps: 5000,
      goal: 'Wind tunnels for racing cars often have a moving belt for a floor. Guess: does our racing car make more downforce with the rolling road than with a still floor? Then test both.' }
  };
  var ORDER = ['drag', 'down', 'glide', 'race', 'road'], NAMES = { penguin: 'penguin', ball: 'ball', tear: 'teardrop' };
  var S = { ch: 'drag', ctrl: labCircle(8), rw: 20, flap: 10, ang: 4, guess: ['ball', 'penguin', 'tear'], road: 'more' };
  var trials = { drag: [], down: [], glide: [], race: null, road: null }, best = {};
  try { best = JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { best = {}; }
  function save() { try { localStorage.setItem(LS, JSON.stringify(best)); } catch (e) { } }
  var nx = 200, ny = 100, cur = null, job = null, foc = -1, holding = false, last = '';

  /* bodies for the current challenge, placed in its grid */
  function labBody(ctrl) {
    var D = 0.11 * nx, P = splinePts(ctrl, 12).map(function (p) { return [0.3 * nx + p[0] * D, 0.5 * ny - p[1] * D]; });
    return { polys: [P], box: [0.3 * nx - 3.3 * D, 0.5 * ny - 1.7 * D, 0.3 * nx + 3.3 * D, 0.5 * ny + 1.7 * D], wheels: [], struts: [], ref: D, length: 2 * D };
  }
  function sameArea(id) { // a library body scaled to the area of a circle of diameter D
    var o = Object.assign({}, LIB[id]), A = 0; o.parts().forEach(function (P) { A += K.abs(areaCen(P).A); });
    o.len = 0.11 * K.sqrt(K.PI / 4 / A); return o;
  }
  function spec(ch, which) { // -> {pb, ground, rolling, ref, label, o}
    var o, pb;
    if (ch === 'drag') { pb = labBody(S.ctrl); return { pb: pb, ground: 0, ref: pb.ref, label: 'your body' }; }
    if (ch === 'glide') { o = LIB.bwing; pb = placeBody(o, nx, ny, S.ang); return { pb: pb, ground: 0, ref: refOf(o, nx, ny), label: 'wing at ' + S.ang + '°' }; }
    if (ch === 'race') { o = sameArea(which); pb = placeBody(o, nx, ny, 0); return { pb: pb, ground: 0, ref: 0.11 * nx, label: NAMES[which] }; }
    var opts = ch === 'down' ? { rw: S.rw, flap: S.flap } : null; o = LIB.rnow; pb = placeBody(o, nx, ny, 0, opts);
    return { pb: pb, ground: 1, rolling: ch === 'down' ? true : which === 'roll', ref: refOf(o, nx, ny), label: ch === 'down' ? 'rear wing ' + S.rw + '°, flap ' + S.flap + '°' : (which === 'roll' ? 'rolling road' : 'still floor') };
  }
  function setup(sp) {
    nx = CH[S.ch].grid[0]; ny = CH[S.ch].grid[1];
    F.init(nx, ny, 0.1, 0.012 * nx / 240, sp.ground); F.rolling = !!sp.rolling; F.setBody(maskOf(sp.pb)); cur = sp;
  }
  function idle() { if (job) return; nx = CH[S.ch].grid[0]; ny = CH[S.ch].grid[1]; setup(spec(S.ch, S.ch === 'race' ? 'penguin' : S.ch === 'road' ? 'roll' : null)); g.redraw(); }

  /* running trials, a few milliseconds of steps per frame */
  function start() {
    if (job) { job = null; runB.textContent = '▶ Run trial'; idle(); g.say('Trial stopped.'); return; }
    var list = S.ch === 'race' ? ['penguin', 'ball', 'tear'] : S.ch === 'road' ? ['still', 'roll'] : [null];
    job = { list: list, i: 0, res: [], ch: S.ch };
    runB.textContent = '■ Stop'; begin(); g.say('Trial running.');
    requestAnimationFrame(tick);
  }
  function begin() { setup(spec(job.ch, job.list[job.i])); }
  function tick() {
    if (!job) return;
    var n = CH[job.ch].steps, t0 = performance.now();
    while (F.t < n && performance.now() - t0 < 14) { for (var q = 0; q < 10 && F.t < n; q++) { if (F.t === n / 2) F.avg(true); F.step(); } }
    if (!F.sane()) { job = null; runB.textContent = '▶ Run trial'; idle(); g.say('That trial became unstable. Try a gentler design.'); return; }
    if (F.t >= n) { job.res.push(F.coef(cur.ref, true)); job.i++; if (job.i < job.list.length) begin(); else { var j = job; job = null; runB.textContent = '▶ Run trial'; done(j); return; } }
    g.redraw(); requestAnimationFrame(tick);
  }
  function f2(v) { return Gallery.fmt(v, 2); }
  function done(j) {
    var r = j.res, ch = j.ch, msg, b = best[ch];
    if (ch === 'drag') {
      var s = r[0].cd; trials.drag.push(s);
      if (!b || s < b.s) { best.drag = { s: s, ctrl: S.ctrl.map(function (p) { return [+p[0].toFixed(4), +p[1].toFixed(4)]; }) }; save(); }
      msg = 'Drag coefficient ' + f2(s) + '.';
    } else if (ch === 'down') {
      var dn = -r[0].cl, ok = r[0].cd <= BUDGET; trials.down.push(ok ? dn : NaN);
      if (ok && (!b || dn > b.s)) { best.down = { s: dn, rw: S.rw, flap: S.flap }; save(); }
      msg = 'Downforce coefficient ' + f2(dn) + ', drag coefficient ' + f2(r[0].cd) + (ok ? ': within the budget.' : ': over the budget, so it doesn\'t count.');
    } else if (ch === 'glide') {
      var ld = r[0].cl / r[0].cd; trials.glide.push([S.ang, ld]);
      if (!b || ld > b.s) { best.glide = { s: ld, a: S.ang }; save(); }
      msg = 'At ' + S.ang + '°, lift ÷ drag is ' + Gallery.fmt(ld, 2) + '.';
    } else if (ch === 'race') {
      var ids = ['penguin', 'ball', 'tear'], order = ids.slice().sort(function (a, z) { return r[ids.indexOf(a)].cd - r[ids.indexOf(z)].cd; }), pts = 0;
      for (var i = 0; i < 3; i++) if (order[i] === S.guess[i]) pts++;
      trials.race = { ids: ids, cd: r.map(function (q) { return q.cd; }) };
      if (!b || pts > b.s) { best.race = { s: pts }; save(); }
      msg = 'Least drag to most: ' + order.map(function (k) { return NAMES[k] + ' ' + f2(r[ids.indexOf(k)].cd); }).join(', ') + '. You placed ' + pts + ' of 3.';
    } else {
      var a = -r[0].cl, z = -r[1].cl, same = K.abs(z - a) < 0.1 * K.max(K.abs(a), K.abs(z)), truth = same ? 'same' : z > a ? 'more' : 'less', win = S.road === truth ? 1 : 0;
      trials.road = { a: a, z: z };
      if (!b || win > b.s) { best.road = { s: win }; save(); }
      msg = 'Downforce coefficient: still floor ' + f2(a) + ', rolling road ' + f2(z) + '. ' + (win ? 'Your guess was right.' : 'Not this time.');
    }
    last = msg; g.say(msg); g.redraw();
  }

  /* drawing */
  function frame() { // on narrow screens, show the front 70% of the test section, larger
    var vw = c.w < 600 ? 0.7 * nx : nx, s = K.min(c.w / vw, c.h / ny); return { s: s, ox: (c.w - vw * s) / 2, oy: (c.h - ny * s) / 2 };
  }
  function handle(i, ctrl) { var D = 0.11 * nx, fr = frame(), p = (ctrl || S.ctrl)[i]; return { x: fr.ox + (0.3 * nx + p[0] * D) * fr.s, y: fr.oy + (0.5 * ny - p[1] * D) * fr.s }; }
  g.draw(function (col) {
    var x = c.ctx, fr = frame(), s = fr.s;
    function T(X, Y) { return [fr.ox + X * s, fr.oy + Y * s]; }
    x.fillStyle = col.bg; x.fillRect(0, 0, c.w, c.h);
    paint(x, F, fr.ox, fr.oy, nx * s, ny * s, view, smoke, col);
    if (cur.ground) drawGround(x, F, T, s, col, nx * s);
    drawBody(x, cur.pb, T, s, col, false);
    if (S.ch === 'drag' && !job) for (var i = 0; i < S.ctrl.length; i++) {
      var h = handle(i); x.fillStyle = col.gold; x.strokeStyle = col.ink; x.lineWidth = 1.5;
      x.beginPath(); x.arc(h.x, h.y, c.w < 600 ? 5.5 : 7, 0, 7); x.fill(); x.stroke();
      if (i === foc) { x.strokeStyle = col.gold; x.lineWidth = 3; x.beginPath(); x.arc(h.x, h.y, holding ? 14 : 12, 0, 7); x.stroke(); }
    }
    x.font = '13px system-ui,sans-serif'; x.fillStyle = col.ink; x.textAlign = 'left'; x.fillText('wind →', fr.ox + 8, fr.oy + 18);
    if (job) {
      var n = CH[job.ch].steps, done = (job.i * n + F.t) / (job.list.length * n);
      x.fillStyle = col.a(col.bg, 0.85); x.fillRect(fr.ox + 8, fr.oy + ny * s - 30, 210, 22);
      x.fillStyle = col.green; x.fillRect(fr.ox + 12, fr.oy + ny * s - 12, 202 * done, 3);
      x.fillStyle = col.ink; x.fillText('Testing ' + cur.label + '… ' + K.round(done * 100) + '%', fr.ox + 12, fr.oy + ny * s - 16);
    } else nsKey(x, fr.ox + 8, cur.ground ? fr.oy + 34 : fr.oy + ny * s - 10, NS_KEYLAB[view], col, paint);
    chart(col);
    var b = best[S.ch], bt = !b ? 'none yet' : S.ch === 'drag' ? 'drag ' + f2(b.s) : S.ch === 'down' ? 'downforce ' + f2(b.s) + ' (wing ' + b.rw + '°, flap ' + b.flap + '°)' :
      S.ch === 'glide' ? 'lift ÷ drag ' + Gallery.fmt(b.s, 2) + ' at ' + b.a + '°' : S.ch === 'race' ? b.s + ' of 3' : (b.s ? 'right guess' : 'not yet right');
    st.innerHTML = '<b>' + CH[S.ch].name + '</b> · your best: <b>' + bt + '</b>' + (last ? ' · ' + last : '') + (S.ch === 'drag' ? ' · Reynolds number <b>220</b> (by D)' : S.ch === 'glide' ? ' · Reynolds number <b>520</b> (by chord)' : S.ch === 'race' ? ' · Reynolds number <b>220</b> (by D)' : ' · Reynolds number <b>840</b> (by length)');
  });
  function chart(col) {
    var x = cc.ctx, W = cc.w, H = cc.h, t;
    if (S.ch === 'drag') lineChart(x, W, H, [{ v: trials.drag, color: col.gold, label: 'drag in each trial (lower is better)', dots: 1, big: trials.drag.indexOf(K.min.apply(null, trials.drag)) }], col, { lo: 0.4, hi: 1.6, n: K.max(8, trials.drag.length), xlab: 'trial →' });
    else if (S.ch === 'down') lineChart(x, W, H, [{ v: trials.down, color: col.green, label: 'downforce in each trial within budget', dots: 1 }], col, { lo: 2, hi: 4, n: K.max(8, trials.down.length), xlab: 'trial →' });
    else if (S.ch === 'glide') { t = trials.glide; lineChart(x, W, H, [{ v: t.map(function (q) { return q[1]; }), xs: t.map(function (q) { return q[0]; }), color: col.green, label: 'lift ÷ drag', dots: 1 }], col, { lo: 0, hi: 3, x0: -4, x1: 25, xlab: 'angle: −4° to 25° →' }); }
    else bars(x, W, H, col);
  }
  function bars(x, W, H, col) {
    x.fillStyle = col.bg; x.fillRect(0, 0, W, H);
    var items = S.ch === 'race' ? (trials.race ? trials.race.ids.map(function (k, i) { return [NAMES[k], trials.race.cd[i]]; }) : []) : (trials.road ? [['still floor', trials.road.a], ['rolling road', trials.road.z]] : []);
    x.font = '600 11px system-ui,sans-serif'; x.textAlign = 'left'; x.fillStyle = col.ink;
    x.fillText(S.ch === 'race' ? 'drag coefficient (same area)' : 'downforce coefficient', 10, 14);
    if (!items.length) { x.fillStyle = col.muted; x.font = '12px system-ui,sans-serif'; x.fillText('Run the test to see the results here.', 10, H / 2 + 4); return; }
    var mx = 0.01; items.forEach(function (q) { mx = K.max(mx, K.abs(q[1])); });
    var bh = K.min(22, (H - 26) / items.length - 6), L = 96, Wb = W - L - 60;
    items.forEach(function (q, i) {
      var y = 24 + i * (bh + 6); x.fillStyle = col.ink; x.font = '12px system-ui,sans-serif'; x.textAlign = 'right'; x.fillText(q[0], L - 6, y + bh / 2 + 4);
      x.fillStyle = q[1] < 0 ? col.red : (S.ch === 'race' ? col.gold : col.green); x.fillRect(L, y, Wb * K.abs(q[1]) / mx, bh);
      x.fillStyle = col.ink; x.textAlign = 'left'; x.fillText(f2(q[1]), L + Wb * K.abs(q[1]) / mx + 5, y + bh / 2 + 4);
    });
  }

  /* controls */
  var row = g.group();
  g.select({ parent: row, label: 'Challenge', value: S.ch, options: ORDER.map(function (k) { return [k, CH[k].name]; }), change: function (v) { if (job) start(); S.ch = v; last = ''; showRows(); idle(); g.say(CH[v].name + '. ' + CH[v].goal); } });
  var goal = g.el('p', 'gx-hint'); goal.style.width = '100%'; g.bar.appendChild(goal);
  var rows = {};
  rows.drag = g.group();
  g.button('Back to a circle', function () { S.ctrl = labCircle(8); idle(); g.say('Back to a circle.'); }, { parent: rows.drag });
  g.button('Load my best shape', function () { if (best.drag && best.drag.ctrl) { S.ctrl = best.drag.ctrl.map(function (p) { return p.slice(); }); idle(); g.say('Your best shape is back.'); } else g.say('No best shape saved yet.'); }, { parent: rows.drag });
  rows.drag.appendChild(g.el('span', 'gx-hint', 'Keyboard: on the picture, arrow keys pick a point, Enter picks it up, arrows move it, Enter drops it.'));
  rows.down = g.group();
  g.slider({ parent: rows.down, label: 'Rear wing angle', min: 0, max: 45, value: S.rw, fmt: function (v) { return v + '°'; }, input: function (v) { S.rw = v; idle(); } });
  g.slider({ parent: rows.down, label: 'Flap angle', min: 0, max: 40, value: S.flap, fmt: function (v) { return v + '°'; }, input: function (v) { S.flap = v; idle(); } });
  rows.glide = g.group();
  g.slider({ parent: rows.glide, label: 'Angle of attack', min: -4, max: 25, value: S.ang, fmt: function (v) { return v + '°'; }, input: function (v) { S.ang = v; idle(); } });
  rows.race = g.group();
  ['Least drag', 'Middle', 'Most drag'].forEach(function (lab, i) {
    g.select({ parent: rows.race, label: lab, value: S.guess[i], options: [['penguin', 'penguin'], ['ball', 'ball'], ['tear', 'teardrop']], change: function (v) { S.guess[i] = v; } });
  });
  rows.road = g.group();
  g.select({ parent: rows.road, label: 'My guess: with the rolling road the car makes', value: S.road, options: [['more', 'more downforce'], ['same', 'about the same'], ['less', 'less downforce']], change: function (v) { S.road = v; } });
  var row9 = g.group();
  var runB = g.button('▶ Run trial', start, { parent: row9, pri: 1 });
  g.select({ parent: row9, label: 'Color shows', value: 'p', options: [['p', 'pressure'], ['s', 'speed'], ['w', 'swirl']], change: function (v) { view = v; g.redraw(); } });
  g.toggle('Smoke', true, function (v) { smoke = v; g.redraw(); }, { parent: row9 });
  var st = g.out('', { parent: statsBox });
  var honest = g.el('p', 'gx-hint', 'Every trial runs the same number of steps from the same start and averages the forces over its second half, so the same design always gets the same score. Bests are kept in this browser only. The same note applies: a 2D model at a low Reynolds number.');
  g.bar.appendChild(honest);
  function showRows() { for (var k in rows) rows[k].hidden = k !== S.ch; goal.textContent = CH[S.ch].goal; foc = -1; holding = false; }

  /* dragging the control points: RuleDrag (static/js/rule-drag.js) keeps every drag on an allowed shape */
  function toCtrl(pt) { var fr = frame(), D = 0.11 * nx; return [((pt.x - fr.ox) / fr.s - 0.3 * nx) / D, -((pt.y - fr.oy) / fr.s - 0.5 * ny) / D]; }
  function moved(i) { return function (state) { S.ctrl = state; foc = i; last = ''; idle(); }; }
  function wire() {
    var RD = window.RuleDrag;
    RD.attach(c.el, {
      point: function (e) { var r = c.el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; },
      begin: function (pt) {
        if (S.ch !== 'drag' || job) return null;
        var bi = -1, bd = 22; for (var i = 0; i < S.ctrl.length; i++) { var h = handle(i), d = K.hypot(h.x - pt.x, h.y - pt.y); if (d < bd) { bd = d; bi = i; } }
        if (bi < 0) return null;
        holding = true;
        return { grab: handle(bi), project: function (q) { var n = S.ctrl.slice(); n[bi] = toCtrl(q); return labFix(n); }, move: moved(bi), end: function () { holding = false; g.redraw(); g.say('Shape changed. Run a trial to measure it.'); }, cancel: function () { holding = false; g.redraw(); } };
      }
    });
    RD.keys(c.el, {
      items: function () { return S.ch === 'drag' && !job ? [1, 2, 3, 4, 5, 6, 7, 8] : []; }, // 1-based: RuleDrag treats 0 as no item
      itemAt: function (n) { return handle(n - 1); },
      focus: function (n) { foc = n - 1; g.redraw(); g.say('Point ' + n + ' of 8. Press Enter to pick it up.'); },
      pick: function (n) {
        var i = n - 1;
        var base = S.ctrl, states = [], st0 = null;
        for (var a = -10; a <= 10; a++) for (var b = -10; b <= 10; b++) { var n = base.slice(); n[i] = [base[i][0] + a * 0.04, base[i][1] + b * 0.04]; var f = labFix(n); if (f) { states.push(f); if (!a && !b) st0 = f; } }
        if (!st0) return null;
        holding = true; g.say('Picked up. Arrow keys move it; Enter drops it; Escape puts it back.');
        return { states: states, start: st0, at: function (s) { return handle(i, s); }, move: moved(i), end: function () { holding = false; g.redraw(); g.say('Dropped. Run a trial to measure it.'); }, cancel: function () { holding = false; S.ctrl = base; idle(); g.say('Put back.'); } };
      },
      blocked: function () { g.say('No allowed shape that way.'); }
    });
  }
  if (window.RuleDrag) wire(); else {
    var sc = document.createElement('script'), cs = document.querySelector('script[src*="gallery/core.js"]');
    sc.src = cs ? cs.src.replace(/gallery\/core\.js.*$/, 'js/rule-drag.js') : '/js/rule-drag.js';
    sc.onload = wire; sc.onerror = function () { g.say('The shape editor could not load.'); };
    document.head.appendChild(sc);
  }
  c.onresize = function () { g.redraw(); };
  cc.onresize = function () { g.redraw(); };
  showRows(); idle();
  return { show: function () { c.fit(); cc.fit(); g.redraw(); }, hide: function () { if (job) start(); } };
}

/* registered last, so the shared code above (LIB and friends) is ready when the piece runs */
Gallery.piece('navier-stokes', function (g) {
  var stage0 = g.stage, host = stage0.parentNode, bar0 = g.bar, stats0 = host.querySelector('.gx-stats') || bar0;
  var draws = {}, scene = 'wing', building = 'wing', S = {};
  var realDraw = g.draw;
  realDraw(function (col) { if (draws[scene]) draws[scene](col); });
  g.draw = function (fn) { draws[building] = fn; g.redraw(); };
  var sw = g.el('div', 'gx-row gx-ns-scenes'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Choose a scene');
  sw.appendChild(g.el('span', 'gx-lbl', 'Scene:'));
  host.insertBefore(sw, stage0);
  function box(parent, contents) { var d = g.el('div'); if (contents) d.style.display = 'contents'; parent.appendChild(d); return d; }
  function build(name, label, fn) {
    building = name;
    var b = { st: box(stage0), br: box(bar0, 1), sx: box(stats0, 1) };
    var btn = g.el('button', 'gx-btn', label); btn.type = 'button'; sw.appendChild(btn); b.btn = btn;
    btn.addEventListener('click', function () { show(name, true); });
    if (name !== scene) b.st.hidden = b.br.hidden = b.sx.hidden = true;
    g.stage = b.st; g.bar = b.br;
    b.api = fn(g, b.sx);
    S[name] = b;
  }
  function show(name, say) {
    if (name === scene && say) return;
    var old = S[scene]; if (old && old.api.hide) old.api.hide();
    scene = name;
    for (var k in S) { var on = k === name; S[k].st.hidden = S[k].br.hidden = S[k].sx.hidden = !on; S[k].btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    if (S[name].api.show) S[name].api.show();
    g.redraw();
    if (say) g.say({ wing: 'Scene: air over a wing.', shapes: 'Scene: shapes, cars and animals in the wind.', lab: 'Scene: Shape Lab, five challenges.', disk: "Scene: Euler's disk settling on a table." }[name]);
  }
  build('wing', 'Wing', wingScene);
  build('shapes', 'Shapes, cars & animals', shapesScene);
  build('lab', 'Shape Lab', labScene);
  build('disk', "Euler's disk", diskScene);
  building = 'wing'; g.stage = stage0; g.bar = bar0;
  show('wing');
});
})();
