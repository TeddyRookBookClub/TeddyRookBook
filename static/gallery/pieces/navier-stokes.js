/* Math Gallery: air past a wing. Our lattice Boltzmann solver (D2Q9, BGK: incompressible Navier-Stokes at low Mach).
   NACA 4-digit wing, bounce-back walls, forces by momentum exchange; semi-Lagrangian smoke; grid adapts to the device. */
Gallery.piece('navier-stokes', function (g) {
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
  var st = g.out();
  g.bar.appendChild(g.el('p', 'gx-hint', 'Drag up or down on the picture, or use the arrow keys on it, to tilt the wing. Forces are measured in this small 2D model at a low Reynolds number; a race car wing works in the millions.'));
  var d0 = null;
  function tilt(a, say) { a = K.max(-10, K.min(25, K.round(a))); if (a !== P.a) { P.a = a; aS.set(a); changed(say && 'Angle of attack ' + a + ' degrees.'); } }
  g.drag(c.el, { down: function (X, Y) { d0 = [Y, P.a]; }, move: function (X, Y) { if (d0) tilt(d0[1] - (Y - d0[0]) / 6); }, up: function () { d0 = null; g.say('Angle of attack ' + P.a + ' degrees.'); } });
  g.keys(c.el, { ArrowUp: function () { tilt(P.a + 1, 1); }, ArrowDown: function () { tilt(P.a - 1, 1); } });
  c.onresize = function () { init(); if (!Lp.playing()) settle(900); };
  init(); if (g.reduced) settle(1500);
});
