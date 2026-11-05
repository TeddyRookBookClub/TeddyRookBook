/* Math Gallery: Navier-Stokes. Two scenes behind a switch:
   "Wing": our lattice Boltzmann solver (D2Q9, BGK: incompressible Navier-Stokes at low Mach). NACA 4-digit wing,
     bounce-back walls, forces by momentum exchange; semi-Lagrangian smoke; grid adapts to the device.
   "Euler's disk": Moffatt's model (Nature 404, 833, 2000) of a disk settling on a table. Tilt a = a0 (1 - t/t0)^(1/3),
     contact point rate W^2 = 4g/(R sin a); the air film under the disk by lubrication theory (Reynolds equation,
     solved once in the frame turning with the contact point); a graph; a Web Audio whirr at 8 x W/2pi, started only
     by a tap, ducking the background music with the window event 'trb:sound-start'. */
(function () {
'use strict';
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
    if (say) g.say(name === 'wing' ? 'Scene: air over a wing.' : "Scene: Euler's disk settling on a table.");
  }
  build('wing', 'Wing', wingScene);
  build('disk', "Euler's disk", diskScene);
  building = 'wing'; g.stage = stage0; g.bar = bar0;
  show('wing');
});

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
})();
