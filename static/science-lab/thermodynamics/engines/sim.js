/* Engines, Refrigerators and Heat Pumps (/science-lab/thermodynamics/engines/): drawing and controls.
   The models are in physics.js (window.Th4Phys). */
(function () {
  'use strict';
  var L = window.TRBLab, P = window.Th4Phys, root = document.getElementById('th4-lab');
  if (!L || !P || !root) return;
  function $(id) { return document.getElementById(id); }
  var C = { bg: '#06111a', bg2: '#0b1b27', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  var reduced = L.reduced, store = L.store('thermo-engines'), TAU = Math.PI * 2, SANS = 'system-ui,-apple-system,Segoe UI,sans-serif';
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgb(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  var COLD = hex(C.blue), HOT = hex(C.red), WHITE = hex('#e8e3d4');
  function tcol(t) { t = clamp(t, 0, 1); return t < 0.5 ? mix(COLD, WHITE, t * 2) : mix(WHITE, HOT, t * 2 - 1); }
  function roundRect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }
  function f(v, d) { return L.fmt(v, d); }
  /* text with a subscript, e.g. Q with h: draws "Qh" with the h small and low; align 'left' | 'right' | 'center' */
  function subText(c, base, sb, x, y, align) {
    var font = c.font, m = /(\d+(?:\.\d+)?)px/.exec(font), px = m ? +m[1] : 12, small = font.replace(/\d+(?:\.\d+)?px/, Math.round(px * 0.72) + 'px');
    var w1 = c.measureText(base).width; c.font = small; var w2 = c.measureText(sb).width; c.font = font;
    var x0 = align === 'right' ? x - w1 - w2 : align === 'center' ? x - (w1 + w2) / 2 : x, ta = c.textAlign; c.textAlign = 'left';
    c.fillText(base, x0, y); c.font = small; c.fillText(sb, x0 + w1, y + px * 0.25); c.font = font; c.textAlign = ta;
  }
  function nice(v) { var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * e; }
  function arrowBand(c, pts, w, col) { // a thick arrow along a polyline
    c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineJoin = 'round'; c.lineCap = 'butt';
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length - 1; i++) c.lineTo(pts[i][0], pts[i][1]);
    var a = pts[pts.length - 2], b = pts[pts.length - 1], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, hl = Math.min(Math.max(8, w * 0.9), d * 0.55);
    c.lineTo(b[0] - ux * hl, b[1] - uy * hl); c.stroke();
    c.fillStyle = col; c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - ux * hl - uy * (w / 2 + 5), b[1] - uy * hl + ux * (w / 2 + 5)); c.lineTo(b[0] - ux * hl + uy * (w / 2 + 5), b[1] - uy * hl - ux * (w / 2 + 5)); c.closePath(); c.fill();
    c.restore();
  }

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'cycle', title: 'One full turn', goal: 'Watch the engine complete one whole cycle: in from the hot side, out to the cold side.', sec: 'th4-view' },
    { id: 'half', title: 'Better than half', goal: 'Finish a cycle with an efficiency above 50%.', sec: 'th4-view' },
    { id: 'ninety', title: 'Ninety percent', goal: 'Finish a cycle at 90% efficiency or more. Look at how far the piston has to travel.', sec: 'th4-view' },
    { id: 'zero', title: 'Why not zero?', goal: 'Drag the cold side down to 20 K or below. How big must the cylinder get?', sec: 'th4-view' },
    { id: 'fridge', title: 'Run it backward', goal: 'Switch to “Refrigerator / heat pump” and complete one cycle: heat moves from cold to hot.', sec: 'th4-view' },
    { id: 'cop5', title: 'Five for one', goal: 'Backward, finish a cycle with a heating COP of 5 or more: 5 J of heat delivered for every 1 J of work.', sec: 'th4-view' },
    { id: 'stirling', title: 'Coffee power', goal: 'In “A Stirling engine you can watch”, put the engine on the cup of coffee and get the flywheel turning at 1 turn per second or faster.', sec: 'th4-stir' },
    { id: 'snap', title: 'Cold snap', goal: 'In the heat pump calculator, set the outdoor temperature to −25 °C or colder and see what happens to the best possible COP.', sec: 'th4-hp' }
  ];
  var view = $('th4-view');
  var mis = L.missions($('th4-missions'), 'thermo-engines', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'fridge' || id === 'cop5') setMode('fridge'); else if (['cycle', 'half', 'ninety', 'zero'].indexOf(id) >= 0) setMode('engine');
    var el = $(m.sec); if (el && m.sec !== 'th4-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function celebrate(el) { if (reduced || !el) return; el.classList.remove('th4-win'); void el.offsetWidth; el.classList.add('th4-win'); setTimeout(function () { el.classList.remove('th4-win'); }, 1300); }
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }

  /* =========================================================================================
     1. The Carnot engine
     ========================================================================================= */
  var cv = $('th4-cv'), G = L.canvas(cv), ctx = G.c, hud = $('th4-hud'), readEl = $('th4-read');
  var st = {
    Th: clamp(+store.get('Th', 600) || 600, 300, 1500), Tc: clamp(+store.get('Tc', 300) || 300, 10, 1490), r: clamp(+store.get('r', 2) || 2, 1.2, 4),
    gas: store.get('gas', 'he') === 'air' ? 'air' : 'he', mode: 'engine', speed: clamp(+store.get('speed', 1) || 1, 0.25, 3), log: !!store.get('log', false), paused: false
  };
  if (st.Tc > st.Th - 10) st.Tc = st.Th - 10;
  var cyc, phase = 0, cycles = 0, slot = 0, parts = [], pending = null, trace = [];
  var STAGE = {
    engine: ['1 → 2 · Touching the hot side, the gas expands at T_h. It takes in heat Q_h and pushes the piston out.',
      '2 → 3 · Insulated, the gas keeps expanding. With no heat coming in, it cools from T_h to T_c.',
      '3 → 4 · Touching the cold side, the piston squeezes the gas at T_c. It gives heat Q_c to the cold side.',
      '4 → 1 · Insulated again, the piston squeezes the gas. It warms from T_c back to T_h.'],
    fridge: ['1 → 4 · Insulated, the gas expands and cools from T_h down to T_c.',
      '4 → 3 · Touching the cold side, the gas expands at T_c and soaks up heat Q_c from it.',
      '3 → 2 · Insulated, the piston squeezes the gas. It warms from T_c up to T_h.',
      '2 → 1 · Touching the hot side, the piston squeezes the gas at T_h. It gives out heat Q_h = Q_c + W.']
  };
  function build() { cyc = new P.Carnot({ Th: st.Th, Tc: st.Tc, r: st.r, gamma: st.gas === 'air' ? 1.4 : 5 / 3 }); trace = []; }
  build();
  function stageAt(ph) { // the stage in the engine's own numbering, and the fraction along it
    var s = Math.floor(ph) % 4, fr = ph - Math.floor(ph);
    if (st.mode === 'engine') return { k: s, f: fr, s: s };
    return { k: 3 - s, f: 1 - fr, s: s };
  }
  var slotOf = { engine: [0, 1, 2, 1], fridge: [1, 2, 1, 0] };  // 0 hot, 1 insulation, 2 cold
  function setMode(m) { if (st.mode === m) return; st.mode = m; markMode(m); phase = 0; trace = []; pending = null; syncRead(true); }
  var markMode = seg($('th4-mode'), 'data-m', st.mode, function (v) { setMode(v); });
  seg($('th4-gas'), 'data-g', st.gas, function (v) { st.gas = v; store.set('gas', v); queue(); });
  var sTh = $('th4-th'), sTc = $('th4-tc'), sR = $('th4-r'), sSp = $('th4-sp');
  sTh.value = st.Th; sTc.value = st.Tc; sR.value = st.r; sSp.value = st.speed;
  function labels() {
    $('th4-th-o').textContent = st.Th + ' K (' + Math.round(st.Th - 273.15) + ' °C)';
    $('th4-tc-o').textContent = st.Tc + ' K (' + Math.round(st.Tc - 273.15) + ' °C)';
    $('th4-r-o').textContent = f(st.r, 1) + ' ×';
    $('th4-sp-o').textContent = f(st.speed, 2).replace(/\.?0+$/, '') + ' ×';
  }
  /* new settings wait for the end of the current cycle, so the drawing never jumps, unless the engine is paused */
  function queue() { pending = true; if (st.paused || phase === 0) applyPending(); syncRead(true); }
  function applyPending() { if (!pending) return; pending = null; build(); }
  sTh.addEventListener('input', function () { st.Th = +sTh.value; if (st.Tc > st.Th - 10) { st.Tc = st.Th - 10; sTc.value = st.Tc; } store.set('Th', st.Th); store.set('Tc', st.Tc); labels(); queue(); });
  sTc.addEventListener('input', function () { st.Tc = Math.min(+sTc.value, st.Th - 10); sTc.value = st.Tc; store.set('Tc', st.Tc); labels(); queue(); if (st.Tc <= 20) checkZero(); });
  sR.addEventListener('input', function () { st.r = +sR.value; store.set('r', st.r); labels(); queue(); });
  sSp.addEventListener('input', function () { st.speed = +sSp.value; store.set('speed', st.speed); labels(); });
  var logBox = $('th4-log'); logBox.checked = st.log; logBox.addEventListener('change', function () { st.log = logBox.checked; store.set('log', st.log); });
  $('th4-pause').addEventListener('click', function () { st.paused = !st.paused; if (st.paused) applyPending(); this.textContent = st.paused ? '▶' : '❚❚'; this.setAttribute('aria-label', st.paused ? 'Play' : 'Pause'); });
  $('th4-reset').addEventListener('click', function () { phase = 0; trace = []; applyPending(); build(); });
  $('th4-step').addEventListener('click', function () { phase = Math.floor(phase + 1e-9) + 1; if (phase >= 4) { phase = 0; } trace = []; });
  labels();
  cv.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === ' ') { e.preventDefault(); $('th4-pause').click(); }
    else if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); sTc.value = +sTc.value + (k === 'ArrowRight' ? 10 : -10); sTc.dispatchEvent(new Event('input')); }
    else if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); sTh.value = +sTh.value + (k === 'ArrowUp' ? 20 : -20); sTh.dispatchEvent(new Event('input')); }
    else if (k.toLowerCase() === 'm') setMode(st.mode === 'engine' ? 'fridge' : 'engine');
  });
  function checkZero() {
    var c2 = new P.Carnot({ Th: st.Th, Tc: st.Tc, r: st.r, gamma: st.gas === 'air' ? 1.4 : 5 / 3 });
    win('zero', 'At T_c = ' + st.Tc + ' K the gas must expand to ' + Math.round(c2.V[2] / c2.V[0]).toLocaleString('en-US') + ' times its smallest volume. At 0 K: forever.');
  }
  function cycleDone() {
    cycles++;
    if (st.mode === 'engine') {
      win('cycle', 'One cycle: Q_h = ' + f(cyc.Qh, 1) + ' J in, W = ' + f(cyc.W, 1) + ' J of work out, Q_c = ' + f(cyc.Qc, 1) + ' J dumped.');
      if (cyc.eff > 0.5) win('half', 'Efficiency ' + Math.round(cyc.eff * 100) + '%: more than half the heat became work.');
      if (cyc.eff >= 0.9) win('ninety', 'Efficiency ' + Math.round(cyc.eff * 100) + '%, but the gas had to expand ' + Math.round(cyc.V[2] / cyc.V[0]) + ' times.');
    } else {
      win('fridge', 'Backward: ' + f(cyc.Qc, 1) + ' J taken from the cold side, ' + f(cyc.Qh, 1) + ' J delivered to the hot side.');
      if (cyc.copP >= 5) win('cop5', 'Heating COP ' + f(cyc.copP, 1) + ': ' + f(cyc.Qh, 1) + ' J of heat for ' + f(cyc.W, 1) + ' J of work.');
    }
  }
  /* gas particles in the cylinder (just for the look: speed grows with √T) */
  for (var i = 0; i < 46; i++) parts.push({ x: Math.random(), y: Math.random(), a: Math.random() * TAU });
  function syncRead(force) {
    if (!force && frameN % 8) return;
    var c = cyc, rows = [
      ['Carnot efficiency 1 − T_c/T_h', f(c.eff * 100, 1) + '%'],
      ['Heat in from hot, Q_h', f(c.Qh, 1) + ' J'], ['Work out, W', f(c.W, 1) + ' J'], ['Heat out to cold, Q_c', f(c.Qc, 1) + ' J'],
      ['Biggest ÷ smallest volume', f(c.V[2] / c.V[0], c.V[2] / c.V[0] < 100 ? 1 : 0)]
    ];
    if (st.mode === 'fridge') rows = [
      ['Cooling COP = T_c/(T_h − T_c)', f(c.copR, 2)], ['Heating COP = T_h/(T_h − T_c)', f(c.copP, 2)],
      ['Heat taken from cold, Q_c', f(c.Qc, 1) + ' J'], ['Work in, W', f(c.W, 1) + ' J'], ['Heat given to hot, Q_h', f(c.Qh, 1) + ' J']];
    rows.push(['Cycles', cycles]);
    if (pending) rows.push(['New settings', 'from the next cycle']);
    dl(readEl, rows);
  }
  var frameN = 0, slotPos = 0;
  function layout(w, h) {
    if (w >= 700) {
      var top = 70, bot = h - 16, cw = w * 0.25, pw = w * 0.45;
      return { cyl: { x: 14, y: top, w: cw - 10, h: bot - top }, pv: { x: 14 + cw + 8, y: top, w: pw - 16, h: bot - top }, sk: { x: 14 + cw + pw, y: top, w: w - cw - pw - 28, h: bot - top } };
    }
    var t2 = 128, mid = t2 + (h - t2) * 0.48;
    return { cyl: { x: 10, y: t2, w: w * 0.5 - 14, h: mid - t2 - 6 }, sk: { x: w * 0.5 + 2, y: t2, w: w * 0.5 - 12, h: mid - t2 - 6 }, pv: { x: 10, y: mid + 6, w: w - 20, h: h - mid - 16 } };
  }
  function drawCyl(c, b, o, sg) {
    var Vmax = cyc.V[2], Vmin = cyc.V[0];
    var cw = Math.min(b.w * 0.62, 120), cx = b.x + b.w / 2, baseY = b.y + b.h - 54, topY = b.y + 22, ch = baseY - topY;
    // reservoirs strip under the cylinder: hot | insulation | cold, sliding so the active one sits underneath
    var target = slotOf[st.mode][sg.s]; slotPos += (target - slotPos) * (reduced ? 1 : 0.12);
    var bw = Math.min(b.w * 0.9, 150), names = ['HOT  ' + st.Th + ' K', 'insulation', 'COLD  ' + st.Tc + ' K'], cols = ['#c0392b', '#3c4a55', '#1f6fb2'];
    c.save(); c.beginPath(); c.rect(b.x, baseY, b.w, 50); c.clip();
    for (var k = 0; k < 3; k++) {
      var bx = cx - bw / 2 + (k - slotPos) * (bw + 10);
      var g = c.createLinearGradient(0, baseY + 4, 0, baseY + 44); g.addColorStop(0, cols[k]); g.addColorStop(1, k === 1 ? '#262f36' : k === 0 ? '#6e1d16' : '#0f3a63');
      c.fillStyle = g; roundRect(c, bx, baseY + 4, bw, 40, 6); c.fill();
      if (k === 1) { c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 1; for (var hh = -40; hh < bw; hh += 9) { c.beginPath(); c.moveTo(bx + hh, baseY + 44); c.lineTo(bx + hh + 40, baseY + 4); c.stroke(); } }
      c.fillStyle = '#fff'; c.font = '700 11px ' + SANS; c.textAlign = 'center'; c.fillText(names[k], bx + bw / 2, baseY + 28);
    }
    c.restore();
    // cylinder walls and gas
    var frac = (o.V - 0) / Vmax, gasTop = baseY - Math.max(4, ch * frac), x0 = cx - cw / 2;
    var tc = tcol((o.T - st.Tc) / Math.max(1, st.Th - st.Tc));
    var gg = c.createLinearGradient(0, gasTop, 0, baseY); gg.addColorStop(0, rgb(tc, 0.18)); gg.addColorStop(1, rgb(tc, 0.42));
    c.fillStyle = gg; c.fillRect(x0, gasTop, cw, baseY - gasTop);
    var spd = Math.sqrt(o.T / 600) * (reduced ? 0.4 : 1);
    parts.forEach(function (p) {
      if (!st.paused) { p.x += Math.cos(p.a) * 0.012 * spd; p.y += Math.sin(p.a) * 0.012 * spd; if (p.x < 0 || p.x > 1) { p.a = Math.PI - p.a; p.x = clamp(p.x, 0, 1); } if (p.y < 0 || p.y > 1) { p.a = -p.a; p.y = clamp(p.y, 0, 1); } }
      c.fillStyle = rgb(tc, 0.9); c.beginPath(); c.arc(x0 + 4 + p.x * (cw - 8), gasTop + 4 + p.y * Math.max(1, baseY - gasTop - 8), 2.2, 0, TAU); c.fill();
    });
    c.strokeStyle = '#8fb3c6'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, topY); c.lineTo(x0, baseY); c.lineTo(x0 + cw, baseY); c.lineTo(x0 + cw, topY); c.stroke();
    // piston and rod
    var pg = c.createLinearGradient(x0, 0, x0 + cw, 0); pg.addColorStop(0, '#5c6f7c'); pg.addColorStop(0.5, '#b8c7d1'); pg.addColorStop(1, '#5c6f7c');
    c.fillStyle = pg; c.fillRect(x0 + 2, gasTop - 12, cw - 4, 12);
    c.fillStyle = '#8fa3b0'; c.fillRect(cx - 4, b.y, 8, gasTop - 12 - b.y);
    if (Vmax / Vmin > 25) { c.fillStyle = C.gold; c.font = '600 10px ' + SANS; c.textAlign = 'center'; c.fillText('volume grows ' + Math.round(Vmax / Vmin) + '×', cx, topY - 6); }
    // heat flowing through the bottom during the isothermal stages
    var flowing = sg.k === 0 || sg.k === 2;
    if (flowing && !reduced) {
      var hot = sg.k === 0, upward = (hot && st.mode === 'engine') || (!hot && st.mode === 'fridge');
      var col = hot ? C.red : C.blue, tnow = performance.now() / 500;
      for (var j = 0; j < 3; j++) {
        var yy = (tnow + j / 3) % 1, ay = upward ? baseY + 4 - yy * 40 : baseY - 36 + yy * 40, ax = cx + (j - 1) * cw * 0.28;
        c.globalAlpha = Math.sin(yy * Math.PI); c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
        for (var q = 0; q <= 10; q++) { var yq = ay + (upward ? -q : q) * 1.6, xq = ax + Math.sin(q * 0.9 + tnow * 4) * 3; if (q) c.lineTo(xq, yq); else c.moveTo(xq, yq); }
        c.stroke(); c.globalAlpha = 1;
      }
    }
    c.fillStyle = rgb(tc); c.font = '700 13px ' + SANS; c.textAlign = 'center';
    c.fillText(Math.round(o.T) + ' K', cx + (baseY - gasTop < 34 ? cw * 0.28 : 0), baseY - gasTop < 34 ? gasTop - 18 : gasTop + (baseY - gasTop) / 2 + 5);
  }
  function drawPV(c, b, o) {
    var V = cyc.V, Vmax = V[2] * 1.08, Pmax = cyc.at(0, 0).P * 1.1, Pmin = cyc.at(2, 0).P * 0.7, Vmin = V[0] * 0.8, lg = st.log;
    var x0 = b.x + 46, y0 = b.y + 12, w = b.w - 56, h = b.h - 46;
    function X(v) { return lg ? x0 + w * Math.log(v / Vmin) / Math.log(Vmax / Vmin) : x0 + w * v / Vmax; }
    function Y(p) { return lg ? y0 + h - h * Math.log(p / Pmin) / Math.log(Pmax / Pmin) : y0 + h - h * p / Pmax; }
    c.fillStyle = 'rgba(11,27,39,.85)'; roundRect(c, b.x, b.y, b.w, b.h, 10); c.fill();
    // grid and axes
    c.strokeStyle = C.line; c.lineWidth = 1; c.fillStyle = C.muted; c.font = '10px ' + SANS;
    var vt = lg ? null : nice(Vmax * 1000 / 5), pt = lg ? null : nice(Pmax / 1000 / 5);
    c.beginPath();
    if (!lg) {
      for (var v = vt; v < Vmax * 1000; v += vt) { c.moveTo(X(v / 1000), y0); c.lineTo(X(v / 1000), y0 + h); }
      for (var p = pt; p < Pmax / 1000; p += pt) { c.moveTo(x0, Y(p * 1000)); c.lineTo(x0 + w, Y(p * 1000)); }
    } else {
      for (var e = Math.floor(Math.log10(Vmin * 1000)); e <= Math.log10(Vmax * 1000); e++) { var vv = Math.pow(10, e) / 1000; if (vv > Vmin && vv < Vmax) { c.moveTo(X(vv), y0); c.lineTo(X(vv), y0 + h); } }
      for (e = Math.floor(Math.log10(Pmin / 1000)); e <= Math.log10(Pmax / 1000); e++) { var pp = Math.pow(10, e) * 1000; if (pp > Pmin && pp < Pmax) { c.moveTo(x0, Y(pp)); c.lineTo(x0 + w, Y(pp)); } }
    }
    c.stroke();
    c.textAlign = 'center';
    if (!lg) { for (v = vt; v < Vmax * 1000; v += vt) c.fillText(+v.toPrecision(3), X(v / 1000), y0 + h + 13); }
    else for (e = Math.floor(Math.log10(Vmin * 1000)); e <= Math.log10(Vmax * 1000); e++) { vv = Math.pow(10, e) / 1000; if (vv > Vmin && vv < Vmax) c.fillText(+(vv * 1000).toPrecision(2), X(vv), y0 + h + 13); }
    c.fillText('volume V (liters)' + (lg ? ', log scale' : ''), x0 + w / 2, y0 + h + 27);
    c.textAlign = 'right';
    if (!lg) { for (p = pt; p < Pmax / 1000; p += pt) c.fillText(+p.toPrecision(3), x0 - 4, Y(p * 1000) + 3); }
    else for (e = Math.floor(Math.log10(Pmin / 1000)); e <= Math.log10(Pmax / 1000); e++) { pp = Math.pow(10, e) * 1000; if (pp > Pmin && pp < Pmax) c.fillText(+(pp / 1000).toPrecision(2), x0 - 4, Y(pp) + 3); }
    c.save(); c.translate(b.x + 11, y0 + h / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('pressure P (kPa)', 0, 0); c.restore();
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    // full isotherms, faint
    [[st.Th, C.red], [st.Tc, C.blue]].forEach(function (it) {
      c.strokeStyle = it[1]; c.globalAlpha = 0.28; c.setLineDash([4, 5]); c.beginPath();
      for (var i = 0; i <= 80; i++) { var vv2 = Vmin * Math.pow(Vmax / Vmin, i / 80), pp2 = cyc.n * P.R * it[0] / vv2; if (i) c.lineTo(X(vv2), Y(pp2)); else c.moveTo(X(vv2), Y(pp2)); }
      c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    });
    // the work, shaded
    var pts = [];
    for (var k = 0; k < 4; k++) for (var i = 0; i <= 40; i++) { var q = cyc.at(k, i / 40); pts.push([X(q.V), Y(q.P)]); }
    c.fillStyle = st.mode === 'engine' ? 'rgba(99,230,190,.16)' : 'rgba(255,212,121,.14)';
    c.beginPath(); pts.forEach(function (pp3, ii) { if (ii) c.lineTo(pp3[0], pp3[1]); else c.moveTo(pp3[0], pp3[1]); }); c.closePath(); c.fill();
    // the four curves
    var SC = [C.red, '#c9d6de', C.blue, '#c9d6de'];
    for (k = 0; k < 4; k++) {
      c.strokeStyle = SC[k]; c.lineWidth = 2.2; c.globalAlpha = 0.85; c.beginPath();
      for (i = 0; i <= 40; i++) { q = cyc.at(k, i / 40); if (i) c.lineTo(X(q.V), Y(q.P)); else c.moveTo(X(q.V), Y(q.P)); }
      c.stroke(); c.globalAlpha = 1;
    }
    // trace of this cycle so far
    if (trace.length > 1) { c.strokeStyle = '#fff'; c.lineWidth = 3; c.globalAlpha = 0.5; c.beginPath(); trace.forEach(function (t, ii) { if (ii) c.lineTo(X(t[0]), Y(t[1])); else c.moveTo(X(t[0]), Y(t[1])); }); c.stroke(); c.globalAlpha = 1; }
    c.restore();
    // corners
    c.font = '700 11px ' + SANS; c.textAlign = 'center';
    for (k = 0; k < 4; k++) { q = cyc.at(k, 0); var cx = X(q.V), cy = Y(q.P); c.fillStyle = C.bg; c.beginPath(); c.arc(cx, cy, 8, 0, TAU); c.fill(); c.strokeStyle = SC[k]; c.lineWidth = 1.5; c.stroke(); c.fillStyle = C.ink; c.fillText(String(k + 1), cx, cy + 4); }
    // the moving dot
    var dx = X(o.V), dy = Y(o.P), tc = tcol((o.T - st.Tc) / Math.max(1, st.Th - st.Tc));
    var gl = c.createRadialGradient(dx, dy, 0, dx, dy, 16); gl.addColorStop(0, rgb(tc, 0.7)); gl.addColorStop(1, rgb(tc, 0));
    c.fillStyle = gl; c.beginPath(); c.arc(dx, dy, 16, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(dx, dy, 4.5, 0, TAU); c.fill();
    c.fillStyle = st.mode === 'engine' ? C.green : C.gold; c.font = '600 11px ' + SANS; c.textAlign = 'left';
    if (!lg && V[2] / V[0] > 30) { c.fillStyle = C.gold; c.textAlign = 'right'; c.fillText('Squashed? Turn on log scales.', x0 + w - 6, y0 + 14); c.textAlign = 'left'; c.fillStyle = st.mode === 'engine' ? C.green : C.gold; }
    var mid = cyc.at(1, 0.15); c.fillText(st.mode === 'engine' ? 'area = work out, W' : 'area = work in, W', Math.min(X(mid.V) + 10, x0 + w - 110), Y(mid.P) - 14 < y0 + 10 ? y0 + 12 : Y(mid.P) - 14);
  }
  function drawSankey(c, b, o, sg) {
    c.fillStyle = 'rgba(11,27,39,.85)'; roundRect(c, b.x, b.y, b.w, b.h, 10); c.fill();
    var eng = st.mode === 'engine', bxW = Math.min(b.w - 20, 170), cx = b.x + b.w / 2 - (b.w > 200 ? 18 : 10);
    var nar = b.w < 230, hotY = b.y + 10, hotH = nar ? 26 : 34, coldH = nar ? 26 : 34, coldY = b.y + b.h - coldH - 10, ey = (hotY + hotH + coldY) / 2, er = Math.min(28, b.w * 0.12);
    // boxes
    c.fillStyle = '#7c2a24'; roundRect(c, cx - bxW / 2, hotY, bxW, hotH, 8); c.fill();
    c.fillStyle = '#1b4f7d'; roundRect(c, cx - bxW / 2, coldY, bxW, coldH, 8); c.fill();
    c.fillStyle = '#fff'; c.font = '700 ' + (nar ? 10 : 11) + 'px ' + SANS; c.textAlign = 'center';
    c.fillText((nar ? 'hot ' : 'hot side · ') + st.Th + ' K', cx, hotY + hotH / 2 + 4); c.fillText((nar ? 'cold ' : 'cold side · ') + st.Tc + ' K', cx, coldY + coldH / 2 + 4);
    // band widths to scale: Q_h is the widest
    var maxW = Math.min(b.w * (nar ? 0.24 : 0.34), 54), sc = maxW / cyc.Qh, wh = Math.max(2, cyc.Qh * sc), wc = Math.max(2, cyc.Qc * sc), ww = Math.max(2, cyc.W * sc);
    // how much has flowed so far in this cycle
    var dQh, dQc, Wnow;
    if (eng) { dQh = o.Qin / cyc.Qh; dQc = o.Qout / cyc.Qc; Wnow = o.W / cyc.W; }
    else { dQc = sg.s === 0 ? 0 : sg.s === 1 ? (cyc.Qc - o.Qout) / cyc.Qc : 1; dQh = sg.s === 3 ? (cyc.Qh - o.Qin) / cyc.Qh : 0; Wnow = (cyc.W - o.W) / cyc.W; }
    dQh = clamp(dQh, 0, 1); dQc = clamp(dQc, 0, 1); Wnow = clamp(Wnow, 0, 1);
    var dim = 0.28;
    function band(pts, wd, col, frac, label, lx, ly, val) {
      arrowBand(c, pts, wd, rgb(hex(col), dim));
      if (frac > 0.002) { c.save(); c.globalAlpha = 0.25 + 0.75 * frac; arrowBand(c, pts, wd, col); c.restore(); }
      c.fillStyle = col; c.font = '700 12px ' + SANS; if (label) subText(c, label.charAt(0), label.slice(2), lx, ly, 'left');
      c.fillStyle = C.ink; c.font = '11px ' + SANS; c.fillText(val, lx, ly + 14);
    }
    c.fillStyle = '#0e2a3a'; c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.arc(cx, ey, er, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = C.ink; c.font = '700 10px ' + SANS; c.textAlign = 'center'; c.fillText(eng ? 'engine' : 'pump', cx, ey + 4);
    var lx = cx + Math.max(wh, wc) / 2 + 8;
    if (eng) {
      band([[cx, hotY + hotH], [cx, ey - er]], wh, C.red, dQh, 'Q_h', lx, hotY + hotH + 18, f(cyc.Qh, 1) + ' J');
      band([[cx, ey + er], [cx, coldY]], wc, C.blue, dQc, 'Q_c', lx, coldY - 22, f(cyc.Qc, 1) + ' J');
      band([[cx + er, ey], [b.x + b.w - 8, ey]], ww, C.green, Wnow, '', 0, 0, '');
      var wy = b.w < 230 ? ey + ww / 2 + 22 : ey - ww / 2 - 18;
      c.fillStyle = C.green; c.font = '700 12px ' + SANS; c.textAlign = 'right'; c.fillText('W', b.x + b.w - 10, wy); c.fillStyle = C.ink; c.font = '11px ' + SANS; c.fillText(f(cyc.W, 1) + ' J', b.x + b.w - 10, wy + 13);
    } else {
      band([[cx, ey - er], [cx, hotY + hotH]], wh, C.red, dQh, 'Q_h', lx, hotY + hotH + 18, f(cyc.Qh, 1) + ' J');
      band([[cx, coldY], [cx, ey + er]], wc, C.blue, dQc, 'Q_c', lx, coldY - 22, f(cyc.Qc, 1) + ' J');
      band([[b.x + b.w - 8, ey], [cx + er, ey]], ww, C.gold, Wnow, '', 0, 0, '');
      var wy2 = b.w < 230 ? ey + ww / 2 + 22 : ey - ww / 2 - 18;
      c.fillStyle = C.gold; c.font = '700 12px ' + SANS; c.textAlign = 'right'; c.fillText('W in', b.x + b.w - 10, wy2); c.fillStyle = C.ink; c.font = '11px ' + SANS; c.fillText(f(cyc.W, 1) + ' J', b.x + b.w - 10, wy2 + 13);
    }
  }
  function tick(dt) {
    frameN++;
    G.fit();
    if (!st.paused) {
      var before = Math.floor(phase);
      phase += dt * 0.55 * st.speed;
      if (phase >= 4) { phase -= 4; cycleDone(); trace = []; applyPending(); }
      if (Math.floor(phase) !== before) trace = trace.slice(-1);
    }
    var sg = stageAt(phase), o = cyc.at(sg.k, sg.f);
    if (!st.paused) { trace.push([o.V, o.P]); if (trace.length > 600) trace.shift(); }
    var c = ctx, w = G.w, h = G.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    var lay = layout(w, h);
    drawCyl(c, lay.cyl, o, sg); drawPV(c, lay.pv, o); drawSankey(c, lay.sk, o, sg);
    hud.innerHTML = '<b>' + (st.mode === 'engine' ? 'Engine' : 'Refrigerator / heat pump') + '</b> · ' + STAGE[st.mode][sg.s].replace(/T_h/g, 'T<sub>h</sub>').replace(/T_c/g, 'T<sub>c</sub>').replace(/Q_h/g, 'Q<sub>h</sub>').replace(/Q_c/g, 'Q<sub>c</sub>');
    syncRead(false);
  }
  syncRead(true);
  L.loop(tick, view);

  /* =========================================================================================
     2. The Stirling engine
     ========================================================================================= */
  (function () {
    var wrap = $('th4-stir'), cvS = $('th4-sc'); if (!wrap || !cvS) return;
    var g = L.canvas(cvS), c = g.c, rd = $('th4-sread'), sview = wrap.querySelector('.lab-view');
    var SRC = { plate: { T: 363, name: 'hot plate, 90 °C' }, coffee: { T: 333, name: 'cup of coffee, 60 °C' }, room: { T: 295, name: 'table, room temperature 22 °C' }, ice: { T: 273, name: 'bowl of ice, 0 °C' } };
    var src = store.get('src', 'coffee'); if (!SRC[src]) src = 'coffee';
    var E = new P.Stirling({ Th: SRC[src].T, Tc: 295 }), fast = 0, loop = [], lastRevs = 0, rps = 0, tAcc = 0;
    seg($('th4-src'), 'data-s', src, function (v) { src = v; store.set('src', v); E.Th = SRC[v].T; loop = []; });
    $('th4-spin').addEventListener('click', function () { E.w = Math.max(E.w, 0) + 12; });
    $('th4-spinb').addEventListener('click', function () { E.w = Math.min(E.w, 0) - 20; });
    $('th4-brake').addEventListener('click', function () { E.w = 0; });
    E.w = src === 'ice' ? 0 : 12;
    var steamT = 0;
    function drawS() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var narrow = w < 560, ew = narrow ? w - 24 : Math.min(w * 0.56, 480), ex = 12, cx = ex + ew / 2;
      var S = clamp(Math.min(ew / 400, (h - 20) / 330), 0.55, 1.5);
      var v = E.vols(E.th), Tm = E.Th, Tc = E.Tc, k;
      // heat source at the bottom
      var baseY = h - 14, plateT = 8 * S, chamberH = 40 * S, chW = Math.min(ew * 0.86, 330 * S), chX = cx - chW / 2;
      var botY = baseY - (src === 'coffee' ? 70 : src === 'ice' ? 52 : src === 'plate' ? 36 : 14) * S;
      if (src === 'plate') {
        c.fillStyle = '#2b2f33'; roundRect(c, cx - chW * 0.6, botY + 4 * S, chW * 1.2, 30 * S, 6); c.fill();
        var gl = c.createRadialGradient(cx, botY + 6 * S, 4, cx, botY + 6 * S, chW * 0.55); gl.addColorStop(0, 'rgba(255,90,60,.9)'); gl.addColorStop(1, 'rgba(255,90,60,0)');
        c.fillStyle = gl; c.fillRect(cx - chW * 0.6, botY - 10 * S, chW * 1.2, 20 * S);
      } else if (src === 'coffee') {
        c.fillStyle = '#e9e4da'; c.beginPath(); c.moveTo(cx - chW * 0.42, botY); c.lineTo(cx + chW * 0.42, botY); c.lineTo(cx + chW * 0.36, baseY); c.lineTo(cx - chW * 0.36, baseY); c.closePath(); c.fill();
        c.strokeStyle = '#e9e4da'; c.lineWidth = 8 * S; c.beginPath(); c.arc(cx + chW * 0.44, botY + 32 * S, 17 * S, -Math.PI / 2, Math.PI / 2); c.stroke();
        c.fillStyle = '#5b3a1e'; c.fillRect(cx - chW * 0.41, botY + 1, chW * 0.82, 6 * S);
      } else if (src === 'ice') {
        c.fillStyle = '#2c4f6b'; c.beginPath(); c.ellipse(cx, botY + 30 * S, chW * 0.55, 22 * S, 0, 0, Math.PI); c.fill();
        for (k = 0; k < 5; k++) { c.fillStyle = 'rgba(200,235,255,.85)'; roundRect(c, cx - chW * 0.45 + k * chW * 0.19, botY - 2 + (k % 2) * 4 * S, chW * 0.15, 16 * S, 3); c.fill(); }
      } else { c.fillStyle = '#5a4632'; c.fillRect(ex, botY + 2, ew, 10 * S); }
      // the engine: bottom plate (T_h), chamber, top plate (T_c)
      var bp = botY - plateT, tpY = bp - chamberH - plateT;
      var hotC = tcol((Tm - 273) / 90), coldC = tcol((Tc - 273) / 90);
      c.fillStyle = rgb(hotC); c.fillRect(chX - 6, bp, chW + 12, plateT);
      c.fillStyle = rgb(coldC); c.fillRect(chX - 6, tpY, chW + 12, plateT);
      c.fillStyle = 'rgba(160,200,230,.08)'; c.fillRect(chX, tpY + plateT, chW, chamberH);
      c.strokeStyle = 'rgba(160,200,230,.5)'; c.lineWidth = 1.5; c.strokeRect(chX, tpY + plateT, chW, chamberH);
      // displacer: z_d = 1 at the top (air pushed down to the hot plate)
      var dth = 13 * S, dTravel = chamberH - dth - 4, dy = tpY + plateT + 2 + (1 - v.zd) * dTravel;
      c.fillStyle = rgb(coldC, 0.35); c.fillRect(chX + 1, tpY + plateT + 1, chW - 2, dy - (tpY + plateT) - 1);
      c.fillStyle = rgb(hotC, 0.35); c.fillRect(chX + 1, dy + dth, chW - 2, bp - dy - dth - 1);
      c.fillStyle = '#d9d2c3'; roundRect(c, chX + 6, dy, chW - 12, dth, 3); c.fill();
      c.fillStyle = 'rgba(0,0,0,.12)'; for (k = 0; k < 22; k++) c.fillRect(chX + 10 + k * (chW - 20) / 22, dy + 3 * S + (k % 3) * 2 * S, 2, 2);
      // power piston cylinder on the top plate, left of center
      var pcx = cx - chW * 0.27, pcw = 26 * S, pcH = 52 * S, pcBot = tpY, pcTop = pcBot - pcH;
      c.fillStyle = 'rgba(160,200,230,.08)'; c.fillRect(pcx - pcw / 2, pcTop, pcw, pcH);
      c.strokeStyle = '#8fb3c6'; c.lineWidth = 2; c.strokeRect(pcx - pcw / 2, pcTop, pcw, pcH);
      var py = pcBot - 6 * S - v.zp * (pcH - 22 * S);
      c.fillStyle = '#b8c7d1'; c.fillRect(pcx - pcw / 2 + 2, py - 10 * S, pcw - 4, 10 * S);
      // flywheel above, on a frame
      var fr = 60 * S, fx = cx + chW * 0.08, fy = pcTop - 22 * S - fr, th = E.th;
      c.strokeStyle = '#6b7f8c'; c.lineWidth = 4 * S; c.beginPath(); c.moveTo(fx - fr * 0.9, tpY); c.lineTo(fx, fy); c.lineTo(fx + fr * 0.9, tpY); c.stroke();
      c.strokeStyle = '#c9d6de'; c.lineWidth = 6 * S; c.beginPath(); c.arc(fx, fy, fr, 0, TAU); c.stroke();
      c.lineWidth = 2; for (k = 0; k < 6; k++) { var a = th + k * Math.PI / 3; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(a) * fr, fy + Math.sin(a) * fr); c.stroke(); }
      if (Math.abs(E.w) > 15 && !reduced) { c.strokeStyle = 'rgba(201,214,222,.16)'; c.lineWidth = fr * 0.9; c.beginPath(); c.arc(fx, fy, fr * 0.5, 0, TAU); c.stroke(); }
      // crank pins: the piston pin and, a quarter turn ahead, the displacer pin
      var cr = fr * 0.34, pA = th + Math.PI / 2, dA = th + Math.PI;
      var ppx = fx + Math.cos(pA) * cr, ppy = fy + Math.sin(pA) * cr, dpx = fx + Math.cos(dA) * cr, dpy = fy + Math.sin(dA) * cr;
      var rodX = cx + chW * 0.24, rodTop = dy - (dy - tpY) - 16 * S + (dy - (tpY + plateT + 2 + 0.5 * dTravel));
      c.strokeStyle = C.gold; c.lineWidth = 3 * S; c.beginPath(); c.moveTo(ppx, ppy); c.lineTo(pcx, py - 10 * S); c.stroke();
      c.strokeStyle = C.pink; c.beginPath(); c.moveTo(dpx, dpy); c.lineTo(rodX, rodTop); c.lineTo(rodX, dy); c.stroke();
      c.fillStyle = C.gold; c.beginPath(); c.arc(ppx, ppy, 4.5 * S, 0, TAU); c.fill(); c.fillStyle = C.pink; c.beginPath(); c.arc(dpx, dpy, 4.5 * S, 0, TAU); c.fill();
      c.fillStyle = '#c9d6de'; c.beginPath(); c.arc(fx, fy, 5 * S, 0, TAU); c.fill();
      // steam over the coffee
      if (src === 'coffee' && !reduced) { steamT += 0.016; c.strokeStyle = 'rgba(230,230,230,.18)'; c.lineWidth = 3; for (k = 0; k < 3; k++) { var sx = chX + chW + 12 + k * 9 * S; if (sx > w - 6) continue; c.beginPath(); for (var q = 0; q < 12; q++) { var yy = bp - q * 5 * S, xx = sx + Math.sin(q * 0.7 + steamT * 3 + k) * 4; if (q) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); } }
      c.font = '600 11px ' + SANS; c.textAlign = 'left'; c.fillStyle = C.gold; c.fillText('piston', pcx + pcw / 2 + 4, pcTop + 12);
      c.fillStyle = C.pink; c.fillText('displacer', chX + 8, tpY + plateT + 12 > dy ? dy + dth + 11 : tpY + plateT + 12);
      // the pressure–volume loop: on the right, or as an inset at the top on narrow screens
      var lx, ly, lw, lh;
      if (narrow) { lw = Math.min(150, w * 0.42); lh = 86; lx = w - lw - 10; ly = 10; } else { lx = ex + ew + 24; lw = w - lx - 14; lh = Math.min(h - 70, 230); ly = (h - lh) / 2 - 10; }
      if (lw > 90) {
        c.fillStyle = 'rgba(11,27,39,.9)'; roundRect(c, lx, ly, lw, lh + (narrow ? 22 : 40), 10); c.fill();
        c.fillStyle = C.muted; c.font = (narrow ? '10px ' : '11px ') + SANS; c.textAlign = 'left'; c.fillText(narrow ? 'P–V loop' : 'pressure against volume, this engine', lx + 10, ly + 14);
        var vs = [], ps = [], vmin = Infinity, vmax = -Infinity, pmin = Infinity, pmax = -Infinity;
        for (k = 0; k <= 72; k++) { var tt = k * TAU / 72, vv = E.vols(tt).V, pp = E.pressure(tt); vs.push(vv); ps.push(pp); vmin = Math.min(vmin, vv); vmax = Math.max(vmax, vv); pmin = Math.min(pmin, pp); pmax = Math.max(pmax, pp); }
        var padP = Math.max(1500, (pmax - pmin) * 0.15); pmin -= padP; pmax += padP;
        var ax0 = lx + (narrow ? 12 : 30), ay0 = ly + 22, aw = lw - (narrow ? 22 : 44), ah = lh - 30;
        var X = function (vv2) { return ax0 + aw * (vv2 - vmin) / (vmax - vmin || 1); }, Y = function (pp2) { return ay0 + ah - ah * (pp2 - pmin) / (pmax - pmin || 1); };
        c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(ax0, ay0); c.lineTo(ax0, ay0 + ah); c.lineTo(ax0 + aw, ay0 + ah); c.stroke();
        var Wc = E.cycleWork(), lc = Wc > 1e-6 ? C.green : Wc < -1e-6 ? C.pink : C.muted;
        c.fillStyle = Wc > 1e-6 ? 'rgba(99,230,190,.16)' : 'rgba(249,168,212,.14)'; c.strokeStyle = lc; c.lineWidth = 2; c.beginPath();
        for (k = 0; k < vs.length; k++) { if (k) c.lineTo(X(vs[k]), Y(ps[k])); else c.moveTo(X(vs[k]), Y(ps[k])); } c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.arc(X(v.V), Y(E.pressure(E.th)), 4, 0, TAU); c.fill();
        if (!narrow) {
          c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center'; c.fillText('volume →', ax0 + aw / 2, ay0 + ah + 13);
          c.save(); c.translate(lx + 14, ay0 + ah / 2); c.rotate(-Math.PI / 2); c.fillText('pressure →', 0, 0); c.restore();
        }
        c.fillStyle = lc; c.textAlign = 'left'; c.font = '600 ' + (narrow ? 10 : 12) + 'px ' + SANS;
        c.fillText(Math.abs(Wc) < 1e-6 ? 'no area: no work' : (narrow ? '' : 'loop area = work: ') + f(Math.abs(Wc) * 1000, 1) + ' mJ per turn' + (Wc < 0 ? ' (backward)' : ''), lx + 10, ly + lh + (narrow ? 14 : 30));
      }
    }
    var rdN = 0;
    L.loop(function (dt) {
      var n = 40, h2 = dt / n; for (var k = 0; k < n; k++) E.step(h2);
      tAcc += dt; if (tAcc > 0.5) { rps = (E.revs - lastRevs) / tAcc; lastRevs = E.revs; tAcc = 0; }
      if (src === 'coffee' && rps >= 1) { fast += dt; if (fast > 3) win('stirling', 'Running on a cup of coffee at ' + f(rps, 1) + ' turns per second!', sview); } else fast = 0;
      drawS();
      if (rdN++ % 8 === 0) {
        var Wc = E.cycleWork();
        dl(rd, [['Bottom / top plate', Math.round(E.Th - 273.15) + ' °C / ' + Math.round(E.Tc - 273.15) + ' °C'], ['Flywheel', f(Math.abs(rps), 2) + ' turns/s' + (rps < -0.05 ? ' (backward)' : '')],
          ['Work per turn (ideal)', f(Wc * 1000, 2) + ' mJ'], ['Power now', f(Math.abs(Wc * rps) * 1000, 1) + ' mW'], ['Pressure now', f(E.pressure(E.th) / 1000, 1) + ' kPa']]);
      }
    }, wrap);
  })();

  /* =========================================================================================
     3. Heat pump calculator
     ========================================================================================= */
  (function () {
    var wrap = $('th4-hp'), cvH = $('th4-hc'); if (!wrap || !cvH) return;
    var g = L.canvas(cvH), c = g.c, rd = $('th4-hread'), hview = wrap.querySelector('.lab-view');
    var sOut = $('th4-out'), sIn = $('th4-in'), tout = clamp(+store.get('tout', 0), -30, 20), tin = clamp(+store.get('tin', 21), 16, 24), dirty = true;
    sOut.value = tout; sIn.value = tin;
    function lab() { $('th4-out-o').textContent = tout + ' °C (' + Math.round(tout * 9 / 5 + 32) + ' °F)'; $('th4-in-o').textContent = tin + ' °C (' + Math.round(tin * 9 / 5 + 32) + ' °F)'; }
    sOut.addEventListener('input', function () { tout = +sOut.value; store.set('tout', tout); lab(); dirty = true; if (tout <= -25) win('snap', 'At ' + tout + ' °C the best possible COP is ' + f(P.copHeat(tin + 273.15, tout + 273.15), 1) + ', and real heat pumps get less than that.', hview); });
    sIn.addEventListener('input', function () { tin = +sIn.value; store.set('tin', tin); lab(); dirty = true; });
    lab();
    function drawH() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var Th = tin + 273.15, Tc = tout + 273.15, cop = P.copHeat(Th, Tc), narrow = w < 600;
      // left: the house, the outdoor unit and three flows for 1 kWh of electricity, to scale
      var hw = narrow ? w - 20 : w * 0.46, hx = 10, hy = 10, hh = narrow ? h * 0.48 : h - 20;
      var ground = hy + hh - 8, houseX = hx + hw * 0.5, houseW = hw * 0.5 - 6, wallY = hy + hh * 0.36, roofY = hy + hh * 0.12;
      c.fillStyle = 'rgba(116,192,252,.07)'; roundRect(c, hx, hy, hw, hh, 10); c.fill();
      c.strokeStyle = 'rgba(143,179,198,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx, ground); c.lineTo(hx + hw, ground); c.stroke();
      var hg = c.createLinearGradient(0, wallY, 0, ground); hg.addColorStop(0, 'rgba(255,135,135,.25)'); hg.addColorStop(1, 'rgba(255,212,121,.16)');
      c.fillStyle = hg; c.fillRect(houseX, wallY, houseW, ground - wallY);
      c.strokeStyle = '#c9d6de'; c.lineWidth = 2; c.beginPath(); c.moveTo(houseX - 8, wallY); c.lineTo(houseX + houseW / 2, roofY); c.lineTo(houseX + houseW + 6, wallY); c.stroke();
      c.strokeRect(houseX, wallY, houseW, ground - wallY);
      c.font = '700 12px ' + SANS; c.textAlign = 'left';
      c.fillStyle = C.blue; c.fillText('outdoors ' + tout + ' °C', hx + 8, hy + 18);
      c.fillStyle = C.red; c.fillText('indoors ' + tin + ' °C', houseX + 8, wallY + 18);
      var uw = Math.min(hw * 0.2, 80), ux = hx + hw * 0.24, uh = 42, uy = ground - uh, ucx = ux + uw / 2, ucy = uy + uh / 2;
      var unitW = Math.min(10, (hh * 0.32) / Math.max(cop, 1)), wRed = cop * unitW, wBlue = Math.max(1.5, (cop - 1) * unitW), wGold = unitW;
      // electricity from above, heat from the outdoor air on the left, heat into the house on the right
      arrowBand(c, [[ucx, hy + 40], [ucx, uy - 2]], Math.max(3, wGold), C.gold);
      arrowBand(c, [[hx + 6, ucy], [ux - 2, ucy]], wBlue, 'rgba(116,192,252,.8)');
      arrowBand(c, [[ux + uw + 2, ucy], [houseX + houseW * 0.45, ucy], [houseX + houseW * 0.45, wallY + 34]], wRed, 'rgba(255,135,135,.82)');
      c.fillStyle = '#3b4a55'; roundRect(c, ux, uy, uw, uh, 5); c.fill(); c.strokeStyle = '#8fb3c6'; c.lineWidth = 1.5; c.stroke();
      c.beginPath(); c.arc(ucx, ucy, 13, 0, TAU); c.stroke();
      var fa = reduced ? 0 : performance.now() / 120; for (var k = 0; k < 3; k++) { var a = fa + k * TAU / 3; c.beginPath(); c.moveTo(ucx, ucy); c.lineTo(ucx + Math.cos(a) * 11, ucy + Math.sin(a) * 11); c.stroke(); }
      c.font = '600 11px ' + SANS;
      c.fillStyle = C.gold; c.textAlign = 'left'; c.fillText('electricity: 1 kWh', ucx + Math.max(3, wGold) / 2 + 6, hy + 46);
      c.fillStyle = C.blue; c.fillText('from outdoor air:', hx + 8, ucy - wBlue / 2 - 20); c.fillText('up to ' + f(cop - 1, 1) + ' kWh', hx + 8, ucy - wBlue / 2 - 7);
      c.fillStyle = C.red; c.fillText('heat delivered:', houseX + houseW * 0.45 + wRed / 2 + 6 > houseX + houseW - 60 ? houseX + 8 : houseX + houseW * 0.45 + wRed / 2 + 6, wallY + 36);
      c.fillText('up to ' + f(cop, 1) + ' kWh', houseX + houseW * 0.45 + wRed / 2 + 6 > houseX + houseW - 60 ? houseX + 8 : houseX + houseW * 0.45 + wRed / 2 + 6, wallY + 50);
      // right: COP against outdoor temperature
      var gx = narrow ? 44 : hx + hw + 46, gy = narrow ? hy + hh + 22 : 20, gw = narrow ? w - gx - 14 : w - gx - 14, gh = narrow ? h - gy - 34 : h - 56;
      var Tlo = -30, Thi = 20, cmax = 20;
      function X(t) { return gx + gw * (t - Tlo) / (Thi - Tlo); } function Y(v) { return gy + gh - gh * clamp(v, 0, cmax) / cmax; }
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath();
      for (var t = -30; t <= 20; t += 10) { c.moveTo(X(t), gy); c.lineTo(X(t), gy + gh); }
      for (var v = 0; v <= cmax; v += 5) { c.moveTo(gx, Y(v)); c.lineTo(gx + gw, Y(v)); }
      c.stroke();
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
      for (t = -30; t <= 20; t += 10) c.fillText(t + ' °C', X(t), gy + gh + 13);
      c.fillText('outdoor temperature', gx + gw / 2, gy + gh + 26);
      c.textAlign = 'right'; for (v = 0; v <= cmax; v += 5) c.fillText(String(v), gx - 5, Y(v) + 3);
      c.save(); c.translate(gx - 30, gy + gh / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('COP (heat out ÷ electricity in)', 0, 0); c.restore();
      c.save(); c.beginPath(); c.rect(gx, gy, gw, gh); c.clip();
      c.strokeStyle = C.gold; c.lineWidth = 2.5; c.beginPath();
      for (t = Tlo; t <= Math.min(Thi, tin - 0.5); t += 0.25) { var yv = Y(P.copHeat(Th, t + 273.15)); if (t === Tlo) c.moveTo(X(t), yv); else c.lineTo(X(t), yv); }
      c.stroke(); c.restore();
      c.strokeStyle = 'rgba(219,231,239,.6)'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(gx, Y(1)); c.lineTo(gx + gw, Y(1)); c.stroke(); c.setLineDash([]);
      c.fillStyle = C.ink; c.textAlign = 'left'; c.fillText('electric heater: COP = 1', gx + 6, Y(1) - 5);
      // DOE cold-climate challenge minimum at 5 °F (−15 °C): COP 2.1 to 2.4
      var dx = X(-15); c.strokeStyle = C.pink; c.lineWidth = 3; c.beginPath(); c.moveTo(dx, Y(2.1)); c.lineTo(dx, Y(2.4)); c.stroke();
      c.fillStyle = C.pink; c.beginPath(); c.arc(dx, Y(2.25), 4, 0, TAU); c.fill(); c.textAlign = 'left'; c.fillText('DOE cold-climate goal, −15 °C', dx + 7, Y(2.25) - 14);
      c.fillStyle = C.gold; c.fillText('best possible: T(in) ÷ (T(in) − T(out)), kelvin', gx + 6, gy + 12);
      // current point
      var cx = X(tout), cy = Y(cop); c.strokeStyle = 'rgba(255,212,121,.5)'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(cx, gy + gh); c.lineTo(cx, cy); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, Math.max(gy + 2, cy), 5, 0, TAU); c.fill();
      if (cop > cmax) { c.fillStyle = C.gold; c.textAlign = 'center'; c.fillText('↑ ' + f(cop, 0), cx, gy + 14); }
    }
    L.loop(function () {
      drawH();
      if (dirty) {
        dirty = false; var Th = tin + 273.15, Tc = tout + 273.15, cop = P.copHeat(Th, Tc);
        dl(rd, [['Indoors − outdoors', f(Th - Tc, 0) + ' K'], ['Best possible heating COP', f(cop, 1)], ['Per 1 kWh of electricity, at best', f(cop, 1) + ' kWh of heat'], ['Of that, pulled from outdoors', f(cop - 1, 1) + ' kWh']]);
      }
    }, wrap);
  })();
})();
