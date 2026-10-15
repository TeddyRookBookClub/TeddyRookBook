/* Absolute Zero and the Third Law (/science-lab/thermodynamics/third-law/): drawing and controls.
   The models are in physics.js (window.Th5Phys). */
(function () {
  'use strict';
  var L = window.TRBLab, P = window.Th5Phys, root = document.getElementById('th5-lab');
  if (!L || !P || !root) return;
  function $(id) { return document.getElementById(id); }
  var C = { bg: '#06111a', bg2: '#0b1b27', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  var reduced = L.reduced, store = L.store('thermo-third-law'), TAU = Math.PI * 2, SANS = 'system-ui,-apple-system,Segoe UI,sans-serif';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgb(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function ramp(stops, t) { t = clamp(t, 0, 1) * (stops.length - 1); var i = Math.min(stops.length - 2, Math.floor(t)); return mix(stops[i], stops[i + 1], t - i); }
  function roundRect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function f(v, d) { return L.fmt(v, d); }
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sci(v, d) {
    if (!(v > 0)) return '0'; var e = Math.floor(Math.log10(v)), m = v / Math.pow(10, e);
    if (+m.toFixed(d === undefined ? 1 : d) >= 10) { m /= 10; e++; }
    return m.toFixed(d === undefined ? 1 : d) + ' × 10' + String(e).split('').map(function (ch) { return SUP[ch]; }).join('');
  }
  /* a temperature in kelvin with a sensible prefix: 4.20 K, 3.1 mK, 52 μK, 170 nK, 38 pK; tiny ones in powers of ten */
  function tK(T) {
    if (!(T > 0)) return '0 K';
    var U = [[1e6, 'MK'], [1e3, 'kK'], [1, 'K'], [1e-3, 'mK'], [1e-6, 'μK'], [1e-9, 'nK'], [1e-12, 'pK']];
    if (T >= 1e3 && T < 1e5) return Math.round(T).toLocaleString('en-US') + ' K';
    for (var i = 0; i < U.length; i++) if (T >= U[i][0] * 0.9995) { var v = T / U[i][0]; return (v >= 100 ? Math.round(v) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + ' ' + U[i][1]; }
    return sci(T, 1) + ' K';
  }
  function exactK(T) { // a mark's temperature, keeping its digits: 2.725 K, 77.35 K, 273.15 K, 38 pK, 15 MK
    var U = [[1e6, 'MK'], [1, 'K'], [1e-3, 'mK'], [1e-6, 'μK'], [1e-9, 'nK'], [1e-12, 'pK']];
    if (T >= 1e3 && T < 1e6) return Math.round(T).toLocaleString('en-US') + ' K';
    for (var i = 0; i < U.length; i++) if (T >= U[i][0] * 0.9995) return String(+(T / U[i][0]).toPrecision(5)) + ' ' + U[i][1];
    return tK(T);
  }
  var COLDS = [hex('#e8f6ff'), hex(C.blue), hex('#3d6fae'), hex('#2a3a7a')];

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'round', title: 'First rung', goal: 'Magnetize, then demagnetize: one full round of the cooling ladder.', sec: 'th5-view' },
    { id: 'k1', title: 'Below 1 kelvin', goal: 'Keep climbing down until the sample is colder than 1 K.', sec: 'th5-view' },
    { id: 'mk', title: 'Millikelvin', goal: 'Get below 1 mK, a thousandth of a kelvin.', sec: 'th5-view' },
    { id: 'count', title: 'Six rungs to a microkelvin', goal: 'Start over and reach 1 μK in 6 rounds or fewer. Hint: a stronger magnet, or spins that pull on each other less.', sec: 'th5-view' },
    { id: 'never', title: 'Never zero', goal: 'Do 20 rounds. How close to absolute zero are you now?', sec: 'th5-view' },
    { id: 'evap', title: 'Blow on the soup', goal: 'In the atom trap, lower the walls until the cloud is colder than 1 μK.', sec: 'th5-trap' },
    { id: 'bec', title: 'A new state of matter', goal: 'Keep enough atoms while you cool to make a Bose–Einstein condensate.', sec: 'th5-trap' },
    { id: 'record', title: 'The coldest place', goal: 'On the cosmic thermometer, find the coldest temperature ever made and tap it.', sec: 'th5-ruler' }
  ];
  var view = $('th5-view');
  var mis = L.missions($('th5-missions'), 'thermo-third-law', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'count') restart();
    var el = $(m.sec); if (el && m.sec !== 'th5-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('th5-win'); void el.offsetWidth; el.classList.add('th5-win'); setTimeout(function () { el.classList.remove('th5-win'); }, 1300); }
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. The cooling ladder: magnetize, demagnetize, repeat
     ========================================================================================= */
  var cv = $('th5-cv'), G = L.canvas(cv), ctx = G.c, hud = $('th5-hud'), readEl = $('th5-read');
  var st = { B: clamp(+store.get('B', 1) || 1, 0.2, 8), b: clamp(+store.get('b', 0.1) || 0.1, 0.02, 0.5), T0: +store.get('T0', 4.2) === 1 ? 1 : 4.2, lin: false };
  var lad;   // the ladder: current state and history
  var NS = 30, spins = [];
  for (var i = 0; i < NS; i++) spins.push({ a: Math.random() * TAU, th: Math.random() * TAU, n: Math.random() * TAU, s: Math.random() < 0.5 ? 1 : -1 });
  function restart() {
    lad = { T: st.T0, Bnow: 0, phase: 'ready', t: 0, rounds: 0, path: [[st.T0, P.entropy(st.T0, 0, st.b)]], rungs: [st.T0], Ti: st.T0, heat: [], lastQ: 0, B: st.B, b: st.b, auto: 0, flow: [] };
    sync();
  }
  function S() { return P.entropy(lad.T, lad.Bnow, lad.b); }
  function magnetize() {
    if (lad.phase !== 'ready') return;
    lad.B = st.B; lad.b = st.b; lad.phase = 'mag'; lad.t = 0; lad.Ti = lad.T; lad.Sstart = S(); sync();
  }
  function demagnetize() {
    if (lad.phase !== 'magd') return;
    lad.phase = 'demag'; lad.t = 0; lad.Ti = lad.T; sync();
  }
  function next() { if (lad.phase === 'ready') magnetize(); else if (lad.phase === 'magd') demagnetize(); }
  function sync() {
    $('th5-mag').disabled = lad.phase !== 'ready'; $('th5-demag').disabled = lad.phase !== 'magd';
    var a = $('th5-auto'); a.textContent = lad.auto ? 'Stop the rounds' : 'Run 5 rounds by itself'; a.setAttribute('aria-pressed', String(!!lad.auto));
  }
  $('th5-mag').addEventListener('click', magnetize);
  $('th5-demag').addEventListener('click', demagnetize);
  $('th5-auto').addEventListener('click', function () { lad.auto = lad.auto ? 0 : 5; sync(); });
  $('th5-restart').addEventListener('click', restart);
  $('th5-reset').addEventListener('click', restart);
  var sB = $('th5-B'), sb = $('th5-b'); sB.value = st.B; sb.value = st.b;
  function labs() { $('th5-B-o').textContent = f(st.B, st.B < 1 ? 2 : 1) + ' T'; $('th5-b-o').textContent = f(st.b, 2) + ' T'; var r = P.Beff(0, st.b) / P.Beff(st.B, st.b); $('th5-ratio').textContent = 'Each round multiplies the temperature by ' + (+r.toPrecision(3)) + ' (that is, divides it by ' + (+(1 / r).toPrecision(3)) + ').'; }
  sB.addEventListener('input', function () { st.B = +sB.value; store.set('B', st.B); labs(); });
  sb.addEventListener('input', function () { st.b = +sb.value; store.set('b', st.b); labs(); if (lad.phase === 'ready' && lad.rounds === 0) restart(); });
  seg($('th5-start'), 'data-t', String(st.T0), function (v) { st.T0 = +v; store.set('T0', st.T0); restart(); });
  var linBox = $('th5-lin'); linBox.addEventListener('change', function () { st.lin = linBox.checked; });
  cv.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next(); } else if (e.key.toLowerCase() === 'n') restart(); });
  cv.addEventListener('click', next);
  labs(); restart();

  var DUR = reduced ? 0.6 : 1.4;
  function advance(dt) {
    if (lad.phase === 'mag') {
      lad.t = Math.min(1, lad.t + dt / DUR); lad.Bnow = lad.B * ease(lad.t);
      var s = S(); lad.path.push([lad.T, s]);
      if (!reduced && Math.random() < 0.5) lad.flow.push({ y: 0, x: Math.random() });
      if (lad.t >= 1) { lad.phase = 'magd'; lad.lastQ = lad.T * (lad.Sstart - S()); sync(); }
    } else if (lad.phase === 'demag') {
      lad.t = Math.min(1, lad.t + dt / DUR); lad.Bnow = lad.B * (1 - ease(lad.t));
      lad.T = lad.Ti * P.Beff(lad.Bnow, lad.b) / P.Beff(lad.B, lad.b);
      lad.path.push([lad.T, S()]);
      if (lad.t >= 1) {
        lad.Bnow = 0; lad.T = lad.Ti * P.Beff(0, lad.b) / P.Beff(lad.B, lad.b);
        lad.phase = 'ready'; lad.rounds++; lad.rungs.push(lad.T); lad.heat.push(lad.lastQ); if (lad.auto) lad.auto--; sync();
        var T = lad.T;
        if (lad.rounds === 1) win('round', 'One round: from ' + tK(lad.Ti) + ' down to ' + tK(T) + '.');
        if (T < 1) win('k1', 'Below 1 kelvin: ' + tK(T) + ' after ' + lad.rounds + ' round' + (lad.rounds > 1 ? 's' : '') + '.');
        if (T < 1e-3) win('mk', 'Millikelvin territory: ' + tK(T) + '.');
        if (T < 1e-6 && lad.rounds <= 6) win('count', 'A microkelvin in ' + lad.rounds + ' rounds!');
        if (lad.rounds >= 20) win('never', 'After 20 rounds: ' + tK(T) + '. Still not zero, and it never will be.');
      }
    }
    lad.flow.forEach(function (p) { p.y += dt * 0.9; }); lad.flow = lad.flow.filter(function (p) { return p.y < 1; });
    if (lad.auto && lad.phase === 'ready') magnetize();
    else if (lad.auto && lad.phase === 'magd') demagnetize();
  }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function drawApparatus(c, b, now) {
    var cx = b.x + b.w / 2, sh = Math.min(b.h * 0.36, 140), sw = Math.min(b.w * 0.62, 190, sh * 2.2), sx = cx - sw / 2, sy = b.y + Math.min(b.h * 0.3, 120);
    // the bath above
    var bathH = Math.min(46, b.h * 0.15), bathY = b.y + 4;
    var bathT = lad.phase === 'demag' ? lad.Ti : lad.T;
    c.fillStyle = '#123247'; roundRect(c, cx - sw * 0.6, bathY, sw * 1.2, bathH, 8); c.fill();
    c.strokeStyle = 'rgba(116,192,252,.5)'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = C.ink; c.font = '600 11px ' + SANS; c.textAlign = 'center';
    c.fillText(lad.rounds === 0 ? (st.T0 === 1 ? 'pumped liquid helium bath' : 'liquid helium bath') : 'bath: the sample from round ' + lad.rounds, cx, bathY + bathH / 2 - 2);
    c.fillStyle = C.blue; c.font = '700 12px ' + SANS; c.fillText(tK(bathT), cx, bathY + bathH / 2 + 13);
    // heat switch
    var closed = lad.phase !== 'demag', swTop = bathY + bathH, swBot = sy;
    c.strokeStyle = closed ? C.gold : 'rgba(255,212,121,.35)'; c.lineWidth = 6;
    if (closed) { c.beginPath(); c.moveTo(cx, swTop); c.lineTo(cx, swBot); c.stroke(); }
    else { var gm = (swTop + swBot) / 2; c.beginPath(); c.moveTo(cx, swTop); c.lineTo(cx, gm - 9); c.moveTo(cx, gm + 9); c.lineTo(cx, swBot); c.stroke(); }
    c.fillStyle = C.gold; c.font = '600 10px ' + SANS; c.textAlign = 'left'; c.fillText(closed ? 'heat switch closed' : 'heat switch open', cx + 8, (swTop + swBot) / 2 + 3);
    // heat flowing up while magnetizing
    lad.flow.forEach(function (p) { var y = swBot - p.y * (swBot - swTop); c.fillStyle = 'rgba(255,135,135,' + (1 - p.y) + ')'; c.beginPath(); c.arc(cx + (p.x - 0.5) * 8, y, 3, 0, TAU); c.fill(); });
    // magnet coil (left and right windings), glowing with the field
    var fB = lad.B > 0 ? lad.Bnow / Math.max(lad.B, 0.01) : 0;
    for (var side = -1; side <= 1; side += 2) {
      var x0 = side < 0 ? sx - 22 : sx + sw + 8;
      for (var k = 0; k < 7; k++) {
        var yy = sy - 6 + k * (sh + 12) / 6.5;
        c.fillStyle = fB > 0.02 ? rgb(mix(hex('#3a5568'), hex(C.blue), fB)) : '#3a5568';
        roundRect(c, x0, yy, 14, 9, 4); c.fill();
      }
      if (fB > 0.02 && !reduced) { c.save(); c.globalAlpha = 0.35 * fB; c.shadowColor = C.blue; c.shadowBlur = 18; c.fillStyle = C.blue; c.fillRect(x0 + 2, sy, 10, sh); c.restore(); }
    }
    // the sample with its spins
    var T = lad.T, x = P.muB * P.Beff(lad.Bnow, lad.b) / (P.kB * T), pol = Math.tanh(x), cold = clamp(-Math.log10(T / 10) / 9, 0, 1);
    var sg = c.createLinearGradient(sx, sy, sx, sy + sh); sg.addColorStop(0, rgb(ramp(COLDS, cold), 0.22)); sg.addColorStop(1, rgb(ramp(COLDS, cold), 0.1));
    c.fillStyle = sg; roundRect(c, sx, sy, sw, sh, 10); c.fill(); c.strokeStyle = 'rgba(219,231,239,.55)'; c.lineWidth = 1.5; c.stroke();
    var cols = 6, rows = 5, cw = sw / cols, ch = sh / rows, len = Math.min(cw, ch) * 0.36;
    var Bdir = Math.atan2(-lad.Bnow, 0); // field points up the screen
    for (k = 0; k < NS; k++) {
      var sp = spins[k], bxv = lad.b * Math.cos(sp.th), byv = lad.b * Math.sin(sp.th) + lad.Bnow; // internal field (random direction) + applied field (up)
      var ang = Math.atan2(-byv, bxv), jitter = (1 - pol) * Math.PI;
      if (!reduced) sp.n += (Math.random() - 0.5) * 0.5 * (1 - pol) + 0.02;
      var a = ang + jitter * Math.sin(sp.n + k) + (pol < 0.05 ? sp.a : 0);
      var px = sx + (k % cols + 0.5) * cw, py = sy + (Math.floor(k / cols) + 0.5) * ch;
      var col = rgb(mix(hex(C.pink), hex(C.green), pol));
      c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 2.2;
      var dx = Math.cos(a) * len, dy = Math.sin(a) * len;
      c.beginPath(); c.moveTo(px - dx, py - dy); c.lineTo(px + dx, py + dy); c.stroke();
      c.beginPath(); c.moveTo(px + dx * 1.35, py + dy * 1.35); c.lineTo(px + dx * 0.55 - dy * 0.5, py + dy * 0.55 + dx * 0.5); c.lineTo(px + dx * 0.55 + dy * 0.5, py + dy * 0.55 - dx * 0.5); c.closePath(); c.fill();
    }
    // thermometer readout
    var fs = Math.round(clamp(Math.min(b.w * 0.09, b.h * 0.1), 16, 30));
    c.fillStyle = rgb(ramp(COLDS, cold * 0.6)); c.font = '700 ' + fs + 'px ' + SANS; c.textAlign = 'center';
    c.fillText(tK(T), cx, sy + sh + fs + 8);
    c.fillStyle = C.muted; c.font = '11px ' + SANS;
    c.fillText('field ' + f(lad.Bnow, 2) + ' T · spins lined up ' + Math.round(pol * 100) + '% · round ' + lad.rounds, cx, sy + sh + fs + 25);
  }
  var lminS = null;
  function drawST(c, b) {
    c.fillStyle = 'rgba(11,27,39,.85)'; roundRect(c, b.x, b.y, b.w, b.h, 10); c.fill();
    var x0 = b.x + 42, y0 = b.y + 22, w = b.w - 56, h = b.h - 56, lin = st.lin;
    var Tmax = Math.max(10, st.T0 * 2), target = Math.min(-4, Math.floor(Math.log10(lad.T)) - 2);
    if (lminS === null || reduced) lminS = target; else lminS += (target - lminS) * 0.08;
    var lmin = lminS, lmax = Math.log10(Tmax);
    var linMax = st.T0 * 1.08;
    function X(T) { return lin ? x0 + w * T / linMax : x0 + w * (Math.log10(Math.max(T, 1e-300)) - lmin) / (lmax - lmin); }
    function Y(s) { return y0 + h - h * s / Math.LN2; }
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + h); c.lineTo(x0 + w, y0 + h); c.stroke();
    c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
    if (!lin) {
      for (var e = Math.ceil(lmin); e <= lmax; e++) {
        var X0 = X(Math.pow(10, e)); c.strokeStyle = 'rgba(120,170,200,.08)'; c.beginPath(); c.moveTo(X0, y0); c.lineTo(X0, y0 + h); c.stroke();
        if (e % 3 === 0) c.fillText(tK(Math.pow(10, e)).replace('1.00 ', '1 '), X0, y0 + h + 13);
      }
    } else { for (var tt = 0; tt <= linMax; tt += st.T0 > 2 ? 1 : 0.25) c.fillText(f(tt, st.T0 > 2 ? 0 : 2) + ' K', X(tt), y0 + h + 13); }
    c.fillText('temperature' + (lin ? '' : ' (log scale: each line is 10 times colder)'), x0 + w / 2, y0 + h + 27);
    c.textAlign = 'right'; c.fillText('ln 2', x0 - 4, Y(Math.LN2) + 4); c.fillText('0', x0 - 4, Y(0) + 3);
    c.save(); c.translate(b.x + 12, y0 + h / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('entropy per spin, S/Nk', 0, 0); c.restore();
    c.save(); c.beginPath(); c.rect(x0, y0 - 4, w + 2, h + 8); c.clip();
    // the two entropy curves
    [[0, C.pink, 'field off'], [lad.B || st.B, C.green, 'field ' + f(lad.B || st.B, 1) + ' T']].forEach(function (cu) {
      c.strokeStyle = cu[1]; c.lineWidth = 2; c.globalAlpha = 0.8; c.beginPath();
      for (var i = 0; i <= 240; i++) {
        var T = lin ? linMax * i / 240 : Math.pow(10, lmin + (lmax - lmin) * i / 240), s = T > 0 ? P.entropy(T, cu[0], lad.b) : 0;
        if (i) c.lineTo(X(T), Y(s)); else c.moveTo(X(T), Y(s));
      }
      c.stroke(); c.globalAlpha = 1;
    });
    // the staircase so far
    var pth = lad.path; c.strokeStyle = '#fff'; c.lineWidth = 2.2; c.beginPath();
    for (var i = 0; i < pth.length; i++) { var px = X(pth[i][0]), py = Y(pth[i][1]); if (i) c.lineTo(px, py); else c.moveTo(px, py); }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,.75)'; lad.rungs.forEach(function (T) { var xr = X(T); c.fillRect(xr - 1, Y(0) - 7, 2, 7); });
    var cx = X(lad.T), cy = Y(S()), gl = c.createRadialGradient(cx, cy, 0, cx, cy, 14); gl.addColorStop(0, 'rgba(255,255,255,.8)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gl; c.beginPath(); c.arc(cx, cy, 14, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 4, 0, TAU); c.fill();
    c.restore();
    c.font = '600 11px ' + SANS; c.textAlign = 'left';
    c.fillStyle = C.pink; c.fillText('— field off', x0 + 6, y0 - 6); c.fillStyle = C.green; c.fillText('— field on, ' + f(lad.B || st.B, 1) + ' T', x0 + 86, y0 - 6);
  }
  function drawLadder(c, b) {
    // a log thermometer from 10 K down to 1 nK (or lower), with a dot for each rung reached
    var lo = Math.min(-9, Math.floor(Math.log10(lad.T)) - 1), hi = 1, x0 = b.x + 14, w = b.w - 28, y = b.y + b.h / 2;
    function X(T) { return x0 + w * (hi - Math.log10(T)) / (hi - lo); }
    var g = c.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#2a4a6b'); g.addColorStop(1, '#a8dcff');
    c.fillStyle = g; roundRect(c, x0, y - 4, w, 8, 4); c.fill();
    c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
    [[1, '1 K'], [1e-3, '1 mK'], [1e-6, '1 μK'], [1e-9, '1 nK'], [1e-12, '1 pK'], [1e-15, '1 fK']].forEach(function (m) { if (Math.log10(m[0]) >= lo && Math.log10(m[0]) <= hi) { var X0 = X(m[0]); c.fillRect(X0 - 0.5, y - 9, 1, 18); c.fillText(m[1], X0, y + 21); } });
    lad.rungs.forEach(function (T, i) { var X0 = X(T); c.fillStyle = i === lad.rungs.length - 1 ? '#fff' : C.blue; c.beginPath(); c.arc(X0, y, i === lad.rungs.length - 1 ? 5.5 : 3.5, 0, TAU); c.fill(); });
    c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText('warmer', x0, y - 12); c.textAlign = 'right'; c.fillText('colder →  absolute zero is off the end, forever', x0 + w, y - 12);
  }
  var frameN = 0;
  function tick(dt) {
    frameN++; G.fit();
    advance(dt);
    var c = ctx, w = G.w, h = G.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    var narrow = w < 640, lH = 52;
    if (!narrow) { drawApparatus(c, { x: 12, y: 62, w: w * 0.38, h: h - 62 - lH - 12 }); drawST(c, { x: w * 0.4 + 6, y: 62, w: w * 0.6 - 18, h: h - 62 - lH - 12 }); }
    else { var top = 92, ah = (h - top - lH) * 0.5; drawApparatus(c, { x: 8, y: top, w: w - 16, h: ah - 6 }); drawST(c, { x: 8, y: top + ah, w: w - 16, h: h - top - ah - lH - 6 }); }
    drawLadder(c, { x: 0, y: h - lH - 4, w: w, h: lH });
    var ph = { ready: lad.rounds ? 'Ready for the next round: magnetize.' : 'Ready: magnetize the sample while it touches the bath.', mag: 'Magnetizing: the spins line up, and the heat this releases flows into the bath.', magd: 'Magnetized and still at the bath temperature. Now open the switch and demagnetize.', demag: 'Demagnetizing with the switch open: the spins take energy from the crystal to jiggle, and it gets colder.' };
    hud.innerHTML = '<b>' + tK(lad.T) + '</b> · ' + ph[lad.phase];
    if (frameN % 8 === 0) {
      var q = lad.heat.length ? lad.heat[lad.heat.length - 1] : 0;
      dl(readEl, [['Temperature', tK(lad.T)], ['Rounds', lad.rounds], ['Entropy per spin, S/Nk', f(S(), 4)],
        ['Heat squeezed out last round', lad.heat.length ? sci(q * 8.314462618, 2) + ' J per mole' : '—'],
        ['Rounds to 1 μK from ' + tK(st.T0) + ', these settings', String(Math.ceil(Math.log(st.T0 / 1e-6) / Math.log(P.Beff(st.B, st.b) / P.Beff(0, st.b))))]]);
    }
  }
  L.loop(tick, view);

  /* =========================================================================================
     2. Evaporative cooling of trapped atoms
     ========================================================================================= */
  (function () {
    var wrap = $('th5-trap'), cvT = $('th5-tc'); if (!wrap || !cvT) return;
    var g = L.canvas(cvT), c = g.c, rd = $('th5-tread'), tview = wrap.querySelector('.lab-view');
    var tr, auto = false, depthLog, sl = $('th5-depth'), so = $('th5-depth-o'), scaleE = 12, scaleV = 4, v0;
    function make() { tr = new P.Trap({ seed: Math.floor(Math.random() * 1e9) + 1 }); depthLog = Math.log10(tr.depthK()); sl.value = depthLog; scaleE = 12; v0 = tr.sigmaV(); scaleV = 4.5 * v0; auto = false; syncA(); lab(); }
    function lab() { so.textContent = tK(Math.pow(10, depthLog)); }
    function syncA() { var a = $('th5-auto2'); a.textContent = auto ? '❚❚ Stop lowering' : 'Lower the walls slowly'; a.setAttribute('aria-pressed', String(auto)); }
    sl.addEventListener('input', function () { depthLog = +sl.value; lab(); });
    $('th5-auto2').addEventListener('click', function () { auto = !auto; syncA(); });
    $('th5-drop').addEventListener('click', function () { depthLog = Math.max(+sl.min, depthLog - 1); sl.value = depthLog; lab(); L.toast(tview, 'Walls dropped 10 times lower, all at once.'); });
    $('th5-tnew').addEventListener('click', make);
    make();
    var HOT = [hex(C.blue), hex('#e8e3d4'), hex(C.red), hex(C.gold)];
    function nice(v) { var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
    function draw() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var narrow = w < 600, bw = narrow ? w - 16 : w * 0.56, bh = narrow ? h * 0.55 : h - 16, bx = 8, by = 8;
      // energy picture: each atom sits at its energy, above the bowl; the rim is the trap depth
      var Ud = tr.U, tgt = nice(Ud * 1.15); scaleE += (tgt - scaleE) * (reduced ? 1 : 0.08);
      var floorY = by + bh - 26, topY = by + 30, H = floorY - topY;
      function EY(E) { return floorY - H * E / scaleE; }
      var xr = Math.sqrt(2 * scaleE), cx = bx + bw / 2, half = bw * 0.44;
      function XX(x) { return cx + half * x / xr; }
      c.fillStyle = 'rgba(11,27,39,.85)'; roundRect(c, bx, by, bw, bh, 10); c.fill();
      // bowl
      c.strokeStyle = 'rgba(143,179,198,.6)'; c.lineWidth = 2; c.beginPath();
      var xRim = Math.sqrt(2 * Ud);
      for (var i = 0; i <= 80; i++) { var xx = -xRim + 2 * xRim * i / 80, E = 0.5 * xx * xx; if (i) c.lineTo(XX(xx), EY(E)); else c.moveTo(XX(xx), EY(E)); }
      c.stroke();
      // rim line (the trap depth)
      var ry = EY(Ud); c.setLineDash([6, 5]); c.strokeStyle = C.pink; c.beginPath(); c.moveTo(XX(-xRim) - 30, ry); c.lineTo(XX(xRim) + 30, ry); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.pink; c.font = '600 11px ' + SANS; c.textAlign = 'right'; c.fillText('rim: ' + tK(tr.depthK()), bx + bw - 8, ry - 6);
      // atoms (show up to 1500)
      var n = tr.n, p = tr.p, step = Math.max(1, Math.floor(n / 1500)), kT = tr.kT();
      for (i = 0; i < n; i += step) {
        var o = 6 * i, E2 = tr.energy(i), x1 = p[o];
        var col = ramp(HOT, clamp(E2 / (Ud || 1), 0, 1));
        c.fillStyle = rgb(col, 0.85); c.fillRect(XX(x1) - 1.2, EY(E2) - 1.2, 2.4, 2.4);
      }
      // the condensate (stylized): a bright spike at the very bottom
      var c0 = tr.condensate();
      if (c0 > 0) {
        var ph = Math.min(H * 0.8, 20 + H * 0.7 * c0), gx = cx, gw = 7, gy = floorY;
        var gg = c.createLinearGradient(0, gy - ph, 0, gy); gg.addColorStop(0, 'rgba(255,244,207,0)'); gg.addColorStop(1, 'rgba(255,244,207,.95)');
        c.fillStyle = gg; c.beginPath(); c.moveTo(gx - gw, gy); c.quadraticCurveTo(gx, gy - ph * 2, gx + gw, gy); c.closePath(); c.fill();
        if (!reduced) { c.save(); c.shadowColor = C.gold; c.shadowBlur = 20; c.fillStyle = C.gold; c.beginPath(); c.arc(gx, gy - 3, 5, 0, TAU); c.fill(); c.restore(); }
        c.fillStyle = C.gold; c.textAlign = 'center'; c.font = '700 12px ' + SANS; c.fillText('condensate (stylized): ' + Math.round(c0 * 100) + '%', gx, Math.max(topY, gy - ph - 8));
      }
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'left';
      c.fillText('each dot: a group of atoms, drawn at its energy (higher = hotter)', bx + 10, by + 16);
      c.fillText('energy scale: 0 to ' + tK(scaleE * tr.T0), bx + 10, floorY + 16);
      // speed histogram
      var hx = narrow ? 44 : bx + bw + 46, hy = narrow ? by + bh + 24 : by + 24, hw = narrow ? w - hx - 14 : w - hx - 14, hh = narrow ? h - hy - 34 : h - hy - 44;
      var sv = tr.sigmaV(), tg = nice(Math.max(4.5 * sv, 1e-9)); scaleV += (tg - scaleV) * (reduced ? 1 : 0.08);
      var NB = 40, bins = new Float64Array(NB), vs = Math.sqrt(P.kB * tr.T0 / P.mRb), cnt = 0;
      for (i = 0; i < n; i++) { var o2 = 6 * i, sp = Math.sqrt(p[o2 + 3] * p[o2 + 3] + p[o2 + 4] * p[o2 + 4] + p[o2 + 5] * p[o2 + 5]) * vs, bI = Math.floor(sp / scaleV * NB); if (bI < NB) bins[bI]++; cnt++; }
      var mb = 0; for (i = 0; i < NB; i++) mb = Math.max(mb, bins[i]);
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx, hy + hh); c.lineTo(hx + hw, hy + hh); c.stroke();
      for (i = 0; i < NB; i++) if (bins[i]) { var bh2 = hh * 0.85 * bins[i] / (mb || 1); c.fillStyle = 'rgba(116,192,252,.75)'; c.fillRect(hx + hw * i / NB + 0.5, hy + hh - bh2, hw / NB - 1, bh2); }
      // the starting Maxwell curve on the same axis, for comparison
      c.strokeStyle = 'rgba(255,135,135,.7)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath();
      var peak0 = 0, pts = [];
      for (i = 0; i <= 80; i++) { var v = scaleV * i / 80, q = v / v0, val = q * q * Math.exp(-q * q / 2); pts.push([v, val]); peak0 = Math.max(peak0, val); }
      var shown = false; pts.forEach(function (pp, ii) { var X1 = hx + hw * pp[0] / scaleV, Y1 = hy + hh - hh * 0.85 * pp[1] / peak0 * (sv / v0); if (ii) c.lineTo(X1, Y1); else c.moveTo(X1, Y1); shown = true; });
      c.stroke(); c.setLineDash([]);
      if (c0 > 0) { c.fillStyle = C.gold; c.fillRect(hx + 1, hy + hh * 0.1, 3, hh * 0.9); }
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
      var unit = scaleV >= 0.01 ? 'cm/s' : 'mm/s', mul = scaleV >= 0.01 ? 100 : 1000;
      c.fillText('0', hx, hy + hh + 13); c.fillText(+(scaleV * mul).toPrecision(2) + ' ' + unit, hx + hw - 14, hy + hh + 13);
      c.fillText('atom speed', hx + hw / 2, hy + hh + 26);
      c.textAlign = 'left'; c.fillStyle = C.blue; c.fillText('■ speeds now', hx + 6, hy - 10); c.fillStyle = C.red; c.fillText('- - at the start', hx + 90, hy - 10);
    }
    var rdN = 0;
    L.loop(function (dt) {
      if (auto) { depthLog -= dt * 3 / 25; if (depthLog <= +sl.min) { depthLog = +sl.min; auto = false; syncA(); } sl.value = depthLog; lab(); }
      tr.U = Math.pow(10, depthLog) / tr.T0;
      var nSteps = clamp(Math.round(dt * 60), 1, 3); // keep lab time tied to real time on slow screens
      for (var k = 0; k < nSteps; k++) tr.step(0.15);
      draw();
      var T = tr.T();
      if (tr.n > 1 && T < 1e-6) win('evap', 'The cloud is at ' + tK(T) + ', and ' + sci(tr.N(), 1) + ' atoms are left.', tview);
      if (tr.condensate() > 0.1) win('bec', 'Bose–Einstein condensate! ' + sci(tr.condensate() * tr.N(), 1) + ' atoms in one quantum state.', tview);
      if (rdN++ % 8 === 0) {
        dl(rd, [['Temperature of the cloud', tr.n > 1 ? tK(T) : '—'], ['Atoms left', tr.n > 1 ? sci(tr.N(), 1) : 'none'], ['Condenses below, T<sub>c</sub>', tr.n > 1 ? tK(tr.Tc()) : '—'],
          ['In the condensate', Math.round(tr.condensate() * 100) + '%'], ['Cloud size', tr.n > 1 ? f(tr.sigma() * 1e6, 1) + ' μm' : '—'], ['Typical speed', tr.n > 1 ? f(tr.sigmaV() * 1000, 2) + ' mm/s' : '—']]);
      }
    }, wrap);
  })();

  /* =========================================================================================
     3. The cosmic thermometer: a zoomable log ruler
     ========================================================================================= */
  (function () {
    var wrap = $('th5-ruler'), cvR = $('th5-rc'); if (!wrap || !cvR) return;
    var g = L.canvas(cvR), c = g.c, card = $('th5-card'), rview = wrap.querySelector('.lab-view');
    var M = P.MARKS, LO = -11.5, HI = 9.5, vlo = LO, vhi = HI, sel = -1, hit = [], dirty = true;
    var COL = [hex('#3d4fa8'), hex(C.blue), hex('#e8e3d4'), hex(C.red), hex(C.gold), hex('#fff4cf')];
    function X(lt, w) { return 18 + (w - 36) * (lt - vlo) / (vhi - vlo); }
    function zoom(f2, at) { var span = vhi - vlo, ns = clamp(span * f2, 1.2, HI - LO), a = at === undefined ? (vlo + vhi) / 2 : at, t = (a - vlo) / span; vlo = a - t * ns; vhi = vlo + ns; pan(0); }
    function pan(d) { var span = vhi - vlo; vlo += d; vhi += d; if (vlo < LO) { vlo = LO; vhi = LO + span; } if (vhi > HI) { vhi = HI; vlo = HI - span; } dirty = true; }
    $('th5-zin').addEventListener('click', function () { zoom(0.6); });
    $('th5-zout').addEventListener('click', function () { zoom(1 / 0.6); });
    $('th5-zall').addEventListener('click', function () { vlo = LO; vhi = HI; dirty = true; });
    function show(i) {
      sel = i; dirty = true; var m = M[i];
      var C2 = m.T - 273.15, F = C2 * 9 / 5 + 32;
      card.innerHTML = '<b>' + m.name + '</b> <span class="th5-tval">' + exactK(m.T) + (m.T > 30 && m.T < 1e5 ? ' · ' + Math.round(C2).toLocaleString('en-US') + ' °C · ' + Math.round(F).toLocaleString('en-US') + ' °F' : m.T >= 1e5 ? '' : '') + '</span><p>' + m.note + (m.link ? ' <a href="' + root.dataset.base + m.link + '">Open it</a>.' : '') + '</p><p class="lab-small">Source: <a href="' + m.url + '" target="_blank" rel="noopener">' + m.src + '</a></p>';
      if (m.T < 1e-10) win('record', 'Found it: ' + exactK(m.T) + ', the coldest temperature ever made.', rview);
    }
    var drag = null, ptrs = {}, pinch = null;
    cvR.addEventListener('pointerdown', function (e) {
      cvR.setPointerCapture && cvR.setPointerCapture(e.pointerId); ptrs[e.pointerId] = e.clientX;
      var ids = Object.keys(ptrs); if (ids.length === 2) { pinch = { d: Math.abs(ptrs[ids[0]] - ptrs[ids[1]]) || 1, lo: vlo, hi: vhi }; drag = null; return; }
      drag = { x: e.clientX, lo: vlo, hi: vhi, moved: false };
    });
    cvR.addEventListener('pointermove', function (e) {
      if (!(e.pointerId in ptrs)) return; ptrs[e.pointerId] = e.clientX;
      var w = g.w, ids = Object.keys(ptrs);
      if (pinch && ids.length === 2) { var d = Math.abs(ptrs[ids[0]] - ptrs[ids[1]]) || 1, span = (pinch.hi - pinch.lo) * pinch.d / d, mid = (pinch.lo + pinch.hi) / 2; span = clamp(span, 1.2, HI - LO); vlo = mid - span / 2; vhi = mid + span / 2; pan(0); return; }
      if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true;
      var span2 = drag.hi - drag.lo; vlo = drag.lo - dx / (w - 36) * span2; vhi = vlo + span2; pan(0);
    });
    function up(e) {
      delete ptrs[e.pointerId]; if (pinch) { if (Object.keys(ptrs).length < 2) pinch = null; drag = null; return; }
      if (drag && !drag.moved) { var r = cvR.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, best = -1, bd = 26; hit.forEach(function (hh) { var d = Math.hypot(px - hh.x, py - hh.y); if (d < bd) { bd = d; best = hh.i; } }); if (best >= 0) show(best); }
      drag = null;
    }
    cvR.addEventListener('pointerup', up); cvR.addEventListener('pointercancel', up);
    cvR.addEventListener('wheel', function (e) { e.preventDefault(); var r = cvR.getBoundingClientRect(), at = vlo + (vhi - vlo) * (e.clientX - r.left - 18) / (g.w - 36); zoom(e.deltaY > 0 ? 1.15 : 1 / 1.15, at); }, { passive: false });
    cvR.addEventListener('keydown', function (e) {
      var span = vhi - vlo;
      if (e.key === 'ArrowLeft') { e.preventDefault(); pan(-span * 0.1); } else if (e.key === 'ArrowRight') { e.preventDefault(); pan(span * 0.1); }
      else if (e.key === '+' || e.key === '=') zoom(0.75); else if (e.key === '-') zoom(1 / 0.75);
      else if ((e.key === 'ArrowUp' && sel < M.length - 1) || (e.key === 'ArrowDown' && sel > 0)) { e.preventDefault(); show(sel + (e.key === 'ArrowUp' ? 1 : -1)); var lt = Math.log10(M[sel].T); if (lt < vlo || lt > vhi) pan(lt - (vlo + vhi) / 2); }
    });
    function draw() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var y = Math.round(h * 0.5), x0 = X(vlo, w), x1 = X(vhi, w);
      // the scale, colored from cold to hot
      var gr = c.createLinearGradient(x0, 0, x1, 0);
      for (var k = 0; k <= 8; k++) { var lt = vlo + (vhi - vlo) * k / 8; gr.addColorStop(k / 8, rgb(ramp(COL, (lt - LO) / (HI - LO)))); }
      c.fillStyle = gr; roundRect(c, x0, y - 6, x1 - x0, 12, 6); c.fill();
      // decades
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
      var span = vhi - vlo, every = span > 14 ? 3 : span > 6 ? 1 : 1;
      for (var e = Math.ceil(vlo); e <= Math.floor(vhi); e++) {
        var X0 = X(e, w); c.fillStyle = 'rgba(219,231,239,.5)'; c.fillRect(X0 - 0.5, y - 10, 1, 20);
        if (e % every === 0) { c.fillStyle = C.muted; c.fillText('10' + String(e).split('').map(function (ch) { return SUP[ch]; }).join('') + ' K', X0, y + 24); }
        if (span < 6) for (var s = 2; s < 10; s++) { var Xs = X(e + Math.log10(s), w); if (Xs > x0 && Xs < x1) { c.fillStyle = 'rgba(219,231,239,.25)'; c.fillRect(Xs - 0.5, y - 5, 1, 10); } }
      }
      if (vlo <= LO + 0.01) { c.fillStyle = C.blue; c.textAlign = 'left'; c.font = '600 10px ' + SANS; c.fillText('← 0 K is infinitely far this way', x0, h - 12); }
      // marks: every dot is drawn; labels go in rows above and below, most important first, and are skipped if there is no room
      hit = []; var rows = [[], [], [], [], [], []], PRI = [8, 0, 2, 22, 9, 15, 19, 21, 11, 16, 6, 18, 1, 3, 7, 13, 10, 20, 14, 17, 12, 5, 4];
      c.font = '600 11px ' + SANS;
      M.forEach(function (m, i) {
        var lt = Math.log10(m.T); if (lt < vlo || lt > vhi) return;
        var X1 = X(lt, w), col = rgb(ramp(COL, (lt - LO) / (HI - LO)));
        c.fillStyle = col; c.beginPath(); c.arc(X1, y, i === sel ? 7 : 5, 0, TAU); c.fill();
        if (i === sel) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
        hit.push({ x: X1, y: y, i: i });
      });
      var nRows = h > 260 ? 3 : 2;
      PRI.concat(M.map(function (_, i) { return i; }).filter(function (i) { return PRI.indexOf(i) < 0; })).forEach(function (i) {
        var m = M[i]; if (!m) return; var lt = Math.log10(m.T); if (lt < vlo || lt > vhi) return;
        var X1 = X(lt, w), tw = c.measureText(m.name).width + 14, cxl = clamp(X1, x0 + tw / 2 - 6, x1 - tw / 2 + 6), a0 = cxl - tw / 2, a1 = cxl + tw / 2, spot = -1;
        var order = i === sel ? [0, 3, 1, 4, 2, 5] : (i % 2 ? [3, 0, 4, 1, 5, 2] : [0, 3, 1, 4, 2, 5]);
        for (var q = 0; q < order.length && spot < 0; q++) {
          var rI = order[q]; if (rI % 3 >= nRows) continue;
          var ok = rows[rI].every(function (iv) { return a1 < iv[0] || a0 > iv[1]; });
          if (ok) spot = rI;
        }
        if (spot < 0) return;
        rows[spot].push([a0, a1]);
        var d = spot < 3 ? -1 : 1, r = spot % 3, ly = y + d * (34 + r * 26) + (d > 0 ? 14 : 0);
        c.strokeStyle = 'rgba(219,231,239,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(X1, y + d * 8); c.lineTo(X1, ly - (d > 0 ? 12 : -4)); c.stroke();
        c.fillStyle = i === sel ? '#fff' : C.ink; c.textAlign = 'center'; c.fillText(m.name, cxl, ly);
        hit.push({ x: cxl, y: ly - 4, i: i });
      });
    }
    L.loop(function () { draw(); }, wrap);
    show(M.length - 1 - M.slice().reverse().findIndex(function (m) { return Math.abs(m.T - 2.725) < 1e-9; }));
  })();
})();
