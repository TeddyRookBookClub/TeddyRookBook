/* Entropy and the Second Law (/science-lab/thermodynamics/second-law/): the drawing and controls for the four simulations.
   The models are in physics.js (window.Th3Phys). */
(function () {
  'use strict';
  var L = window.TRBLab, P = window.Th3Phys, root = document.getElementById('th3-lab');
  if (!L || !P || !root) return;
  function $(id) { return document.getElementById(id); }
  var C = { bg: '#06111a', bg2: '#0b1b27', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  var reduced = L.reduced, store = L.store('thermo-second-law'), TAU = Math.PI * 2;
  var FONT = '12px ui-monospace,Menlo,Consolas,monospace', SANS = 'system-ui,-apple-system,Segoe UI,sans-serif';

  /* ---------- small helpers ---------- */
  var SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).split('').map(function (c) { return SUP[c] || c; }).join(''); }
  function sciLn(lnv, d) { // a number given by its natural log, as text: 7.9 × 10⁻³¹
    if (!isFinite(lnv)) return lnv < 0 ? '0' : '∞';
    var l10 = lnv / Math.LN10, e = Math.floor(l10), m = Math.pow(10, l10 - e);
    if (+m.toFixed(d === undefined ? 1 : d) >= 10) { m /= 10; e++; }
    if (e >= -3 && e <= 5) { var v = Math.exp(lnv); return v >= 100 ? Math.round(v).toLocaleString('en-US') : L.fmt(v, v < 1 ? 4 : 2); }
    return m.toFixed(d === undefined ? 1 : d) + ' × 10' + sup(e);
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgb(c, a) { return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')'; }
  function ramp(stops, t) { t = clamp(t, 0, 1) * (stops.length - 1); var i = Math.min(stops.length - 2, Math.floor(t)); return mix(stops[i], stops[i + 1], t - i); }
  var TAGS = [hex(C.blue), hex(C.green), hex(C.gold), hex(C.pink)];
  var HEAT = [hex('#3b6f9c'), hex(C.blue), hex('#e8e3d4'), hex(C.red), hex(C.gold)];
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function sprite(col, r) { // a glowing dot, drawn once
    var s = Math.ceil(r * 3.2), cv = document.createElement('canvas'), dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = Math.ceil(2 * s * dpr); var c = cv.getContext('2d'); c.scale(dpr, dpr);
    var g = c.createRadialGradient(s, s, 0, s, s, s);
    g.addColorStop(0, rgb(col, 0.55)); g.addColorStop(0.3, rgb(col, 0.22)); g.addColorStop(1, rgb(col, 0));
    c.fillStyle = g; c.fillRect(0, 0, 2 * s, 2 * s);
    c.fillStyle = rgb(mix(col, [255, 255, 255], 0.25)); c.beginPath(); c.arc(s, s, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.arc(s - r * 0.3, s - r * 0.35, r * 0.38, 0, TAU); c.fill();
    return { cv: cv, s: s };
  }
  function seg(el, attr, cur, fn) {
    var bs = el.querySelectorAll('button');
    function mark(v) { bs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute(attr) === String(v))); }); }
    bs.forEach(function (b) { b.addEventListener('click', function () { mark(b.getAttribute(attr)); fn(b.getAttribute(attr)); }); });
    mark(cur); return mark;
  }
  function dl(el, rows) { el.innerHTML = rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join(''); }

  /* ---------- missions ---------- */
  var MIS = [
    { id: 'open', title: 'Let them out', goal: 'Open the divider and wait until the entropy meter reaches 95% of its top.', sec: 'th3-view' },
    { id: 'back', title: 'Run the movie backward', goal: 'Let the atoms spread for at least 3 seconds, then press Reverse time. Every atom should march back to the left half.', sec: 'th3-view' },
    { id: 'nudge', title: 'A billionth is enough', goal: 'Let them spread for 10 seconds or more, then press “Reverse + nudge”. This time fewer than 80% make it back.', sec: 'th3-view' },
    { id: 'fluke', title: 'Catch a fluke', goal: 'With 6 atoms, after they have spread, catch all of them on one side at once, by chance alone. Turn up the speed: it can take a minute.', sec: 'th3-view' },
    { id: 'coins', title: 'Ten thousand tosses', goal: 'In “Counting arrangements”, toss 100 coins 10,000 times. Did all 100 ever land on one side?', sec: 'th3-count' },
    { id: 'flow', title: 'Heat flows downhill', goal: 'In “Heat flow as probability”, start with all the energy in solid A and let the quanta wander until A’s share is within 5 quanta of its most likely value.', sec: 'th3-heat' },
    { id: 'demon', title: 'Be the demon', goal: 'In “Maxwell’s demon”, open the door at the right moments until one side is 40 K hotter than the other.', sec: 'th3-demon' },
    { id: 'bill', title: 'Pay the bill', goal: 'Once one side is 20 K hotter or more, erase the demon’s memory and read the ledger.', sec: 'th3-demon' }
  ];
  var view = $('th3-view'), mis = L.missions($('th3-missions'), 'thermo-second-law', MIS, function (id) {
    var m = MIS.filter(function (x) { return x.id === id; })[0]; if (!m) return;
    if (id === 'fluke') setN(6);
    if (id === 'back' || id === 'nudge' || id === 'open') { if (run.opened && id === 'open') { newGas(); } }
    var el = $(m.sec); if (el && m.sec !== 'th3-view') el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  });
  function win(id, text, where) { if (mis.done(id)) { L.toast(where || view, '✓ ' + text); celebrate(where || view); } }
  function celebrate(el) {
    if (reduced || !el) return;
    el.classList.remove('th3-win'); void el.offsetWidth; el.classList.add('th3-win');
    setTimeout(function () { el.classList.remove('th3-win'); }, 1300);
  }

  /* =========================================================================================
     1. The main simulation: atoms spread, and can be run backward
     ========================================================================================= */
  var cv = $('th3-cv'), G = L.canvas(cv), ctx = G.c, hud = $('th3-hud'), readEl = $('th3-read');
  var SPS = 360;                      // time steps in one second of the movie
  var NS = [6, 20, 60, 120, 250];
  var st = { N: +store.get('N', 120), speed: +store.get('speed', 6), trails: store.get('trails', !reduced) !== false, paused: false, slow: false };
  if (NS.indexOf(st.N) < 0) st.N = 120;
  st.speed = clamp(Math.round(st.speed) || 6, 1, 12);
  var gas, ghost, run, trail, sprites = null, spriteR = 0, pick = 0, divAnim = 0;
  function newGas() {
    gas = new P.Gas(st.N, 1 + Math.floor(Math.random() * 1e6));
    ghost = null; divAnim = 0;
    run = { opened: false, tMax: 0, labT: 0, hist: [], marks: [], gap: [], nudged: false, mixed: false, returned: false, best: 0 };
    trail = { n: 0, len: 7, x: new Float32Array(st.N * 7), y: new Float32Array(st.N * 7) };
    st.paused = false; syncButtons();
  }
  function setN(n) { st.N = n; store.set('N', n); markN(n); newGas(); }
  function open() {
    if (run.opened) return;
    gas.divider = false; gas.t = 0; gas.dir = 1; run.opened = true; run.labT = 0; run.hist = [[0, sNow()]];
    syncButtons(); L.toast(view, 'Divider open. Watch the entropy meter.');
  }
  function sNow() { return P.entropyLR(gas.N, gas.left()); }
  function sMax() { return P.lnC(gas.N, Math.floor(gas.N / 2)); }
  function reverse(nudge) {
    if (!run.opened) { L.toast(view, 'Open the divider first.'); return; }
    gas.reverse(); ghost = null; run.nudged = false;
    if (nudge) {
      // nudge the atom nearest the middle of the box by one grid step: a billionth of the box's height
      var best = Infinity; for (var i = 0; i < gas.N; i++) { var dx = gas.x[i] - P.GW / 2, dy = gas.y[i] - P.GH / 2, q = dx * dx + dy * dy; if (q < best) { best = q; pick = i; } }
      ghost = gas.clone(); gas.x[pick] += 1; run.nudged = true; run.gap = [];
    }
    run.marks.push({ t: run.labT, nudge: !!nudge, back: gas.dir < 0 });
    st.paused = false; syncButtons();
    L.toast(view, gas.dir < 0 ? (nudge ? 'Every velocity flipped, and one atom moved by a billionth of the box.' : 'Every velocity flipped. The movie now runs backward.') : 'Flipped again: forward.');
  }
  function arrived() { // the backward run reached the moment the divider opened
    st.paused = true;
    var n = gas.left(), N = gas.N, msg;
    if (!run.nudged) {
      msg = n === N ? 'All ' + N + ' atoms are back on the left. Newton’s laws work just as well backward.' : n + ' of ' + N + ' are back on the left.';
      if (n === N && run.tMax >= 3 * SPS) win('back', 'All ' + N + ' atoms came back: the laws of motion run backward too.');
      else L.toast(view, msg);
    } else {
      msg = n + ' of ' + N + ' found the way back. The outlines show the perfect, un-nudged run.';
      if (n < 0.8 * N) win('nudge', 'Only ' + n + ' of ' + N + ' made it back. A billionth of a nudge ruined it.'); else L.toast(view, msg + (run.tMax < 6 * SPS ? ' Let them spread longer first.' : ''));
    }
    run.returned = true; syncButtons();
  }
  function resumeAfterReturn() { // continuing after a return starts a fresh forward run from here
    gas.dir = 1; gas.t = 0; run.tMax = 0; run.nudged = false; ghost = null; run.returned = false; run.mixed = false;
  }
  function syncButtons() {
    $('th3-open').disabled = run.opened;
    $('th3-rev').disabled = !run.opened; $('th3-nudge').disabled = !run.opened;
    var pb = $('th3-pause'); pb.textContent = st.paused ? '▶' : '❚❚'; pb.setAttribute('aria-label', st.paused ? 'Play' : 'Pause');
    $('th3-slow').setAttribute('aria-pressed', String(st.slow));
  }
  var markN = seg($('th3-n'), 'data-n', st.N, function (v) { setN(+v); });
  $('th3-open').addEventListener('click', open);
  $('th3-rev').addEventListener('click', function () { if (run.returned) resumeAfterReturn(); reverse(false); });
  $('th3-nudge').addEventListener('click', function () { if (run.returned) resumeAfterReturn(); reverse(true); });
  $('th3-new').addEventListener('click', function () { newGas(); });
  $('th3-reset').addEventListener('click', function () { newGas(); });
  $('th3-pause').addEventListener('click', function () { st.paused = !st.paused; if (!st.paused && run.returned) resumeAfterReturn(); syncButtons(); });
  $('th3-slow').addEventListener('click', function () { st.slow = !st.slow; syncButtons(); });
  var spd = $('th3-spd'), spdO = $('th3-spd-o');
  spd.value = st.speed; spdO.textContent = st.speed + ' steps per frame';
  spd.addEventListener('input', function () { st.speed = +spd.value; spdO.textContent = st.speed + ' steps per frame'; store.set('speed', st.speed); });
  var trailsBox = $('th3-trails'); trailsBox.checked = st.trails;
  trailsBox.addEventListener('change', function () { st.trails = trailsBox.checked; store.set('trails', st.trails); trail.n = 0; });
  cv.addEventListener('keydown', function (e) {
    var k = e.key.toLowerCase();
    if (k === ' ') { e.preventDefault(); $('th3-pause').click(); }
    else if (k === 'o') open(); else if (k === 'r') $('th3-rev').click(); else if (k === 'b') $('th3-nudge').click(); else if (k === 'n') newGas();
  });
  var box = { x: 0, y: 0, w: 1, h: 1 };
  cv.addEventListener('pointerdown', function (e) { // tap the divider to open it
    var r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (!run.opened && Math.abs(px - (box.x + box.w / 2)) < 26 && py > box.y - 10 && py < box.y + box.h + 10) open();
  });

  function layout() {
    var w = G.w, h = G.h, top = w < 520 ? 106 : 62, gh = clamp(h * 0.24, 92, 150), meter = 38;
    var aw = w - 28, ah = h - top - gh - meter - 18, bw = Math.min(aw, ah * 2);
    box.w = bw; box.h = bw / 2; box.x = (w - bw) / 2; box.y = top;
    return { meterY: top + box.h + 10, graph: { x: 14, y: top + box.h + meter + 12, w: w - 28, h: h - (top + box.h + meter + 12) - 10 } };
  }
  function ensureSprites(r) {
    if (sprites && Math.abs(r - spriteR) < 0.3) return;
    spriteR = r; sprites = [];
    for (var i = 0; i < 8; i++) sprites.push(sprite(ramp(TAGS, i / 7), r));
  }
  function draw() {
    G.fit();
    var c = ctx, w = G.w, h = G.h, lay = layout(), N = gas.N, sx = box.w / P.GW, sy = box.h / P.GH;
    c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
    // the box
    var bx = box.x, by = box.y, bw = box.w, bh = box.h;
    var g = c.createLinearGradient(bx, by, bx + bw, by); g.addColorStop(0, '#0c2133'); g.addColorStop(0.5, '#0a1a28'); g.addColorStop(1, '#0c2133');
    c.fillStyle = g; roundRect(c, bx - 4, by - 4, bw + 8, bh + 8, 8); c.fill();
    c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(120,170,200,.07)'; c.lineWidth = 1; c.beginPath();
    for (var gx = 1; gx < 16; gx++) { c.moveTo(bx + bw * gx / 16, by); c.lineTo(bx + bw * gx / 16, by + bh); }
    for (var gy = 1; gy < 8; gy++) { c.moveTo(bx, by + bh * gy / 8); c.lineTo(bx + bw, by + bh * gy / 8); }
    c.stroke();
    // the middle line, and the divider itself
    c.setLineDash([4, 6]); c.strokeStyle = 'rgba(143,179,198,.35)'; c.beginPath(); c.moveTo(bx + bw / 2, by); c.lineTo(bx + bw / 2, by + bh); c.stroke(); c.setLineDash([]);
    if (!run.opened || divAnim < 1) {
      if (run.opened) divAnim = Math.min(1, divAnim + (reduced ? 1 : 0.06));
      var lift = divAnim * (bh + 12);
      c.save(); c.beginPath(); c.rect(bx - 6, by - 30, bw + 12, bh + 34); c.clip();
      c.shadowColor = C.gold; c.shadowBlur = 12; c.fillStyle = C.gold; c.fillRect(bx + bw / 2 - 2.5, by - lift, 5, bh); c.restore();
      if (!run.opened) { c.fillStyle = 'rgba(255,212,121,.85)'; c.font = '600 11px ' + SANS; c.textAlign = 'center'; c.fillText('tap to open', bx + bw / 2, by + bh + 16 > lay.meterY ? by - 8 : by + bh + 14); }
    }
    // counts on each side
    var nl = gas.left();
    c.font = '700 ' + Math.round(clamp(bh * 0.16, 16, 34)) + 'px ' + SANS; c.textAlign = 'center'; c.fillStyle = 'rgba(219,231,239,.13)';
    c.fillText(nl, bx + bw / 4, by + bh / 2 + bh * 0.06); c.fillText(N - nl, bx + 3 * bw / 4, by + bh / 2 + bh * 0.06);
    // atoms
    var r = Math.max(2.4, 0.5 * gas.d * sy); ensureSprites(r);
    if (st.trails && !st.paused) {
      var T = trail, k = T.n % T.len; for (var i = 0; i < N; i++) { T.x[i * T.len + k] = gas.x[i]; T.y[i * T.len + k] = gas.y[i]; } T.n++;
    }
    if (st.trails && trail.n > 2) {
      c.lineWidth = Math.max(1, r * 0.8); c.lineCap = 'round';
      var m = Math.min(trail.n, trail.len);
      for (i = 0; i < N; i++) {
        var col = ramp(TAGS, gas.tag[i]); c.strokeStyle = rgb(col, 0.16); c.beginPath();
        for (var j = 0; j < m; j++) {
          var kk = ((trail.n - m + j) % trail.len + trail.len) % trail.len, X = bx + trail.x[i * trail.len + kk] * sx, Y = by + bh - trail.y[i * trail.len + kk] * sy;
          if (j) c.lineTo(X, Y); else c.moveTo(X, Y);
        }
        c.stroke();
      }
    }
    if (ghost) { // the perfect run, as outlines
      c.strokeStyle = 'rgba(219,231,239,.45)'; c.lineWidth = 1;
      for (i = 0; i < N; i++) { c.beginPath(); c.arc(bx + ghost.x[i] * sx, by + bh - ghost.y[i] * sy, r, 0, TAU); c.stroke(); }
    }
    for (i = 0; i < N; i++) {
      var sp = sprites[Math.round(clamp(gas.tag[i], 0, 1) * 7)], X2 = bx + gas.x[i] * sx, Y2 = by + bh - gas.y[i] * sy;
      c.drawImage(sp.cv, X2 - sp.s, Y2 - sp.s, 2 * sp.s, 2 * sp.s);
    }
    if (run.nudged) { // ring around the nudged atom
      var px = bx + gas.x[pick] * sx, py = by + bh - gas.y[pick] * sy, pulse = reduced ? 0 : Math.sin(performance.now() / 180) * 1.5;
      c.strokeStyle = C.pink; c.lineWidth = 2; c.beginPath(); c.arc(px, py, r + 5 + pulse, 0, TAU); c.stroke();
    }
    // entropy meter
    var S = sNow(), Sm = sMax(), my = lay.meterY, mx = 14, mw = w - 28;
    c.fillStyle = C.muted; c.font = '11px ' + SANS; c.textAlign = 'left';
    c.fillText('Entropy  S/k = ln W', mx, my + 9);
    c.textAlign = 'right'; c.fillStyle = C.ink; c.font = FONT; c.fillText(L.fmt(S, 1) + ' of ' + L.fmt(Sm, 1) + ' max', mx + mw, my + 9);
    var barY = my + 14; c.fillStyle = 'rgba(120,170,200,.15)'; roundRect(c, mx, barY, mw, 9, 4.5); c.fill();
    var fr = Sm > 0 ? clamp(S / Sm, 0, 1) : 0, gg = c.createLinearGradient(mx, 0, mx + mw, 0);
    gg.addColorStop(0, C.blue); gg.addColorStop(0.6, C.green); gg.addColorStop(1, C.gold);
    c.fillStyle = gg; roundRect(c, mx, barY, Math.max(9, mw * fr), 9, 4.5); c.fill();
    // graph: entropy against time (always counting up, even when the movie runs backward)
    drawGraph(c, lay.graph, Sm);
    // HUD
    var tS = gas.t / SPS;
    hud.innerHTML = (run.opened ? (gas.dir > 0 ? '▶ forward' : '<b style="color:#f9a8d4">◀ running backward</b>') + ' · t = ' + L.fmt(tS, 1) + ' s' : 'Divider closed. Press <b>Open</b>.') +
      '<br>left <b>' + nl + '</b> · right <b>' + (N - nl) + '</b> · W = ' + sciLn(P.lnC(N, nl)) + (st.paused ? ' · <b>paused</b>' : '');
    // readouts and missions
    if (frameN % 6 === 0) {
      dl(readEl, [
        ['Atoms left / right', nl + ' / ' + (N - nl)],
        ['Arrangements W', sciLn(P.lnC(N, nl))],
        ['Entropy S/k = ln W', L.fmt(S, 2)],
        ['Most it can be', L.fmt(Sm, 2) + ' (' + Math.round(100 * fr) + '% now)'],
        ['Chance all are on the left', sciLn(-N * Math.LN2)],
        ['Movie time', L.fmt(tS, 1) + ' s ' + (gas.dir > 0 ? '▶' : '◀')]
      ]);
    }
    if (run.opened && fr >= 0.95) win('open', 'Spread out: the entropy is at ' + Math.round(fr * 100) + '% of its maximum.');
  }
  function drawGraph(c, gr, Sm) {
    c.fillStyle = 'rgba(11,27,39,.9)'; roundRect(c, gr.x, gr.y, gr.w, gr.h, 8); c.fill();
    var x0 = gr.x + 34, y0 = gr.y + 8, w = gr.w - 34 - (run.nudged || run.gap.length ? 38 : 10), h = gr.h - 26;
    if (w < 40 || h < 30) return;
    var tMax = Math.max(4 * SPS, run.labT * 1.05);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y0 + h); c.lineTo(x0 + w, y0 + h); c.stroke();
    c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'right';
    c.fillText(L.fmt(Sm, 0), x0 - 4, y0 + 8); c.fillText('0', x0 - 4, y0 + h);
    c.save(); c.translate(gr.x + 10, y0 + h / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('S/k', 0, 0); c.restore();
    c.textAlign = 'left'; c.fillText('time since the divider opened (s) →', x0 + 4, y0 + h + 14);
    c.textAlign = 'right'; c.fillText(L.fmt(tMax / SPS, 0) + ' s', x0 + w, y0 + h + 14);
    c.setLineDash([3, 4]); c.strokeStyle = 'rgba(255,212,121,.35)'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w, y0); c.stroke(); c.setLineDash([]);
    run.marks.forEach(function (m) {
      var X = x0 + w * m.t / tMax; c.strokeStyle = m.nudge ? 'rgba(249,168,212,.7)' : 'rgba(219,231,239,.5)'; c.beginPath(); c.moveTo(X, y0); c.lineTo(X, y0 + h); c.stroke();
      c.fillStyle = m.nudge ? C.pink : C.ink; c.textAlign = 'left'; c.fillText(m.nudge ? '⟲ + nudge' : '⟲', X + 3, y0 + 10);
    });
    var H = run.hist; if (H.length > 1) {
      c.strokeStyle = C.green; c.lineWidth = 2; c.lineJoin = 'round'; c.beginPath();
      for (var i = 0; i < H.length; i++) { var X = x0 + w * H[i][0] / tMax, Y = y0 + h - h * clamp(H[i][1] / (Sm || 1), 0, 1.05); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }
      c.stroke();
    }
    if (run.gap.length) { // gap between the nudged run and the perfect run, on a log scale from 10⁻⁹ to 1
      var gx = x0 + w;
      c.fillStyle = C.pink; c.textAlign = 'left'; c.fillText('1', gx + 4, y0 + 8); c.fillText('10⁻⁹', gx + 4, y0 + h);
      c.fillText('gap', gx + 4, y0 + h / 2);
      c.strokeStyle = C.pink; c.lineWidth = 1.6; c.beginPath();
      for (i = 0; i < run.gap.length; i++) { var p = run.gap[i], X3 = x0 + w * p[0] / tMax, Y3 = y0 + h - h * clamp((p[1] + 9) / 9, 0, 1); if (i) c.lineTo(X3, Y3); else c.moveTo(X3, Y3); }
      c.stroke();
    }
  }
  var frameN = 0;
  function tick() {
    frameN++;
    if (!st.paused) {
      var n = st.slow ? 1 : st.speed;
      for (var k = 0; k < n; k++) {
        gas.step(); if (ghost) ghost.step();
        if (run.opened) {
          run.labT++;
          if (gas.dir > 0 && gas.t > run.tMax) run.tMax = gas.t;
          if (gas.dir < 0 && gas.t <= 0) { arrived(); break; }
        }
      }
      if (run.opened) {
        var S = sNow(), H = run.hist; H.push([run.labT, S]);
        if (H.length > 1600) run.hist = H.filter(function (_, i) { return i % 2 === 0 || i === H.length - 1; });
        if (ghost) {
          var s2 = 0; for (var i = 0; i < gas.N; i++) { var dx = gas.x[i] - ghost.x[i], dy = gas.y[i] - ghost.y[i]; s2 += dx * dx + dy * dy; }
          var gap = Math.sqrt(s2 / gas.N) / P.GH; run.gap.push([run.labT, Math.log10(Math.max(1e-9, gap))]);
          if (run.gap.length > 1600) run.gap = run.gap.filter(function (_, i) { return i % 2 === 0; });
        }
        var nl = gas.left(), N = gas.N;
        if (nl > 0 && nl < N && Math.min(nl, N - nl) >= Math.min(2, N / 3)) run.mixed = true;
        if (N <= 10 && run.mixed && gas.dir > 0 && !run.nudged && run.marks.length === 0 && gas.t > SPS && (nl === N || nl === 0)) {
          win('fluke', 'All ' + N + ' atoms on the ' + (nl ? 'left' : 'right') + ', by pure chance! With ' + N + ' atoms that happens about once in ' + Math.pow(2, N - 1) + ' looks.');
          run.mixed = false;
        }
      }
    }
    draw();
  }
  newGas();
  L.loop(tick, view);

  /* =========================================================================================
     2. Counting arrangements: coins (or atoms) on two sides
     ========================================================================================= */
  (function () {
    var wrap = $('th3-count'), cvC = $('th3-cc'); if (!wrap || !cvC) return;
    var g = L.canvas(cvC), c = g.c, r = P.rng(Math.floor(Math.random() * 1e9) + 1);
    var nIn = $('th3-cn'), nOut = $('th3-cn-o'), rd = $('th3-cread');
    var N = clamp(+store.get('coinN', 100) || 100, 2, 200), hist, rounds, last, allSide, queue = 0, dirty = true;
    nIn.value = N;
    function clear() { hist = new Float64Array(N + 1); rounds = 0; last = null; allSide = 0; queue = 0; dirty = true; }
    function toss() { var n = P.Coins.toss(N, r); hist[n]++; rounds++; if (n === 0 || n === N) allSide++; return n; }
    function setN() { N = +nIn.value; nOut.textContent = N; store.set('coinN', N); clear(); }
    nIn.addEventListener('input', setN); setN();
    $('th3-t1').addEventListener('click', function () { last = layoutRound(toss()); dirty = true; check(); });
    $('th3-t100').addEventListener('click', function () { queue += 100; });
    $('th3-t10k').addEventListener('click', function () { queue += 10000; });
    $('th3-tclr').addEventListener('click', clear);
    function layoutRound(n) { // where to draw each coin: n on the left half, N − n on the right
      var pts = []; for (var i = 0; i < N; i++) pts.push([i < n ? r() * 0.46 + 0.02 : 0.52 + r() * 0.46, 0.04 + r() * 0.92, i < n]);
      return { n: n, pts: pts };
    }
    function check() { if (N === 100 && rounds >= 10000) win('coins', '10,000 tosses of 100 coins: ' + (allSide ? allSide : 'never') + ' all on one side.', wrap.querySelector('.lab-view')); }
    function drawC() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var narrow = w < 560, bw = narrow ? w - 24 : Math.min(260, w * 0.34), bh = narrow ? Math.min(110, h * 0.32) : h - 40;
      var bx = 12, by = narrow ? 12 : 20, hx = narrow ? 44 : bx + bw + 52, hy = narrow ? by + bh + 22 : 20, hw = w - hx - 14, hh = narrow ? h - hy - 30 : h - 50;
      // the box with the last round
      c.fillStyle = '#0c2133'; roundRect(c, bx, by, bw, bh, 8); c.fill(); c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 1.5; c.stroke();
      c.setLineDash([4, 5]); c.beginPath(); c.moveTo(bx + bw / 2, by); c.lineTo(bx + bw / 2, by + bh); c.stroke(); c.setLineDash([]);
      if (last) {
        var rad = clamp(Math.sqrt(bw * bh / N) * 0.22, 1.6, 6);
        last.pts.forEach(function (p) { c.fillStyle = p[2] ? C.gold : C.blue; c.beginPath(); c.arc(bx + p[0] * bw, by + p[1] * bh, rad, 0, TAU); c.fill(); });
        c.fillStyle = C.ink; c.font = '600 12px ' + SANS; c.textAlign = 'center';
        c.fillText(last.n + ' left', bx + bw / 4, by + bh - 6); c.fillText((N - last.n) + ' right', bx + 3 * bw / 4, by + bh - 6);
      } else { c.fillStyle = C.muted; c.font = '12px ' + SANS; c.textAlign = 'center'; c.fillText('Press “Toss once”', bx + bw / 2, by + bh / 2); }
      // the histogram, with the exact answer W(n)/2^N as a line
      var maxP = P.Coins.prob(N, Math.floor(N / 2)), maxH = rounds ? Math.max.apply(null, Array.prototype.slice.call(hist)) / rounds : 0, top = Math.max(maxP, maxH) * 1.12;
      c.strokeStyle = C.line; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx, hy + hh); c.lineTo(hx + hw, hy + hh); c.stroke();
      var bwid = hw / (N + 1);
      for (var n = 0; n <= N; n++) if (hist[n]) {
        var f = hist[n] / rounds, X = hx + n * bwid, Hh = hh * f / top;
        c.fillStyle = (n === 0 || n === N) ? C.red : 'rgba(99,230,190,.75)'; c.fillRect(X + bwid * 0.08, hy + hh - Hh, Math.max(1, bwid * 0.84), Hh);
      }
      c.strokeStyle = C.gold; c.lineWidth = 1.8; c.beginPath();
      for (n = 0; n <= N; n++) { var Y = hy + hh - hh * P.Coins.prob(N, n) / top, X2 = hx + (n + 0.5) * bwid; if (n) c.lineTo(X2, Y); else c.moveTo(X2, Y); }
      c.stroke();
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'center';
      c.fillText('0', hx + bwid / 2, hy + hh + 12); c.fillText(String(N), hx + hw - bwid / 2, hy + hh + 12); c.fillText(String(Math.floor(N / 2)), hx + (Math.floor(N / 2) + 0.5) * bwid, hy + hh + 12);
      c.fillText('number on the left side, n', hx + hw / 2, hy + hh + 24);
      c.textAlign = 'left'; c.fillStyle = C.gold; c.fillText('— exact: W(n) ÷ 2' + sup(N), hx + 6, hy + 10);
      c.fillStyle = C.green; c.fillText('■ your tosses: ' + rounds.toLocaleString('en-US') + ' rounds', hx + 6, hy + 24);
    }
    L.loop(function () {
      if (queue > 0) { var k = Math.min(queue, N > 120 ? 600 : 1200); for (var i = 0; i < k; i++) { var n = toss(); if (i === k - 1) last = layoutRound(n); } queue -= k; dirty = true; check(); }
      var changed = dirty;
      if (dirty || Math.abs(g.w - cvC.getBoundingClientRect().width) > 0.5) { drawC(); dirty = false; }
      if (rd && (changed || !rd.firstChild)) {
        var mode = 0, mv = -1; for (var n = 0; n <= N; n++) if (hist[n] > mv) { mv = hist[n]; mode = n; }
        dl(rd, [['Coins N', N], ['Rounds tossed', rounds.toLocaleString('en-US')], ['Most common n', rounds ? mode : '—'], ['All on one side', allSide + ' times'],
          ['Chance per round, all on the left', sciLn(-N * Math.LN2)], ['Arrangements with n = ' + Math.floor(N / 2), sciLn(P.lnC(N, Math.floor(N / 2)))]]);
      }
    }, wrap);
  })();

  /* =========================================================================================
     3. Heat flow as probability: two Einstein solids
     ========================================================================================= */
  (function () {
    var wrap = $('th3-heat'), cvE = $('th3-ec'); if (!wrap || !cvE) return;
    var g = L.canvas(cvE), c = g.c, rd = $('th3-eread');
    var PRE = { tiny: [3, 3, 6], ms: [300, 200, 100], big: [1800, 1200, 600] };
    var pre = store.get('ePre', 'ms'); if (!PRE[pre]) pre = 'ms';
    var E, hist, startA, speed = 1, paused = false, watching = false;
    function make(where) {
      var p = PRE[pre]; startA = where === 'A' ? p[2] : where === 'B' ? 0 : Math.round(p[2] * p[0] / (p[0] + p[1]));
      E = new P.Einstein(p[0], p[1], p[2], startA, Math.floor(Math.random() * 1e9) + 1); hist = [[0, E.qA]];
      watching = where === 'A';
    }
    make('A');
    seg($('th3-epre'), 'data-p', pre, function (v) { pre = v; store.set('ePre', v); make('A'); });
    $('th3-eA').addEventListener('click', function () { make('A'); });
    $('th3-eB').addEventListener('click', function () { make('B'); });
    $('th3-eEven').addEventListener('click', function () { make('even'); });
    var sp = $('th3-esp'), spo = $('th3-esp-o');
    function setSp() { speed = +sp.value; spo.textContent = ['slow', 'medium', 'fast', 'very fast'][speed - 1]; }
    sp.addEventListener('input', setSp); setSp();
    $('th3-epause').addEventListener('click', function () { paused = !paused; this.textContent = paused ? '▶ Play' : '❚❚ Pause'; });
    var HC = [hex('#0e2132'), hex('#7a2f45'), hex(C.red), hex(C.gold), hex('#fff4cf')];
    function drawE() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var NA = E.NA, NB = E.NB, narrow = w < 560;
      var topH = narrow ? h * 0.46 : h * 0.5, gap = 40, colW = (w - 24 - gap) / 2;
      var perA = E.qA / NA, perB = (E.q - E.qA) / NB, hotA = perA > perB + 1e-9, hotB = perB > perA + 1e-9;
      function solid(x0, Nn, off, q, label, hot, cold) {
        var y0 = 34, hh = topH - y0 - 6, cols = Math.max(1, Math.round(Math.sqrt(Nn * colW / hh))), rows = Math.ceil(Nn / cols);
        var cell = Math.min(colW / cols, hh / rows), gw = cell * cols, ox = x0 + (colW - gw) / 2;
        c.fillStyle = hot ? C.red : cold ? C.blue : C.ink; c.font = '700 13px ' + SANS; c.textAlign = 'center';
        c.fillText(label + (hot ? ' · hotter' : cold ? ' · colder' : ''), x0 + colW / 2, 15);
        c.fillStyle = C.muted; c.font = '11px ' + SANS;
        c.fillText(narrow ? q + ' quanta in ' + Nn : Nn + ' oscillators · ' + q + ' quanta · ' + L.fmt(q / Nn, 2) + ' each', x0 + colW / 2, 29);
        var big = cell > 9;
        for (var i = 0; i < Nn; i++) {
          var v = E.n[off + i], X = ox + (i % cols) * cell, Y = y0 + Math.floor(i / cols) * cell;
          c.fillStyle = rgb(ramp(HC, Math.min(v, 4) / 4)); c.fillRect(X + 0.5, Y + 0.5, Math.max(1, cell - 1), Math.max(1, cell - 1));
          if (big && v) { c.fillStyle = v >= 3 ? '#06111a' : '#fff'; c.font = '600 ' + Math.round(cell * 0.45) + 'px ' + SANS; c.fillText(v, X + cell / 2, Y + cell * 0.66); }
        }
        c.strokeStyle = hot ? 'rgba(255,135,135,.6)' : cold ? 'rgba(116,192,252,.6)' : C.line; c.lineWidth = 1.5;
        roundRect(c, ox - 4, y0 - 4, gw + 8, rows * cell + 8, 6); c.stroke();
      }
      solid(12, NA, 0, E.qA, 'Solid A', hotA, hotB);
      solid(12 + colW + gap, NB, NA, E.q - E.qA, 'Solid B', hotB, hotA);
      // net flow arrow over the last stretch
      var k = Math.max(0, hist.length - 30), flow = hist.length > 1 ? hist[hist.length - 1][1] - hist[k][1] : 0, ax = 12 + colW + gap / 2, ay = topH / 2 + 10;
      if (Math.abs(flow) >= Math.max(2, 0.03 * E.q)) {
        var dir = flow < 0 ? 1 : -1, len = gap * 0.42; c.strokeStyle = C.gold; c.fillStyle = C.gold; c.lineWidth = clamp(Math.abs(flow) / Math.max(1, E.q) * 40, 2, 7);
        c.beginPath(); c.moveTo(ax - dir * len, ay); c.lineTo(ax + dir * len * 0.4, ay); c.stroke();
        c.beginPath(); c.moveTo(ax + dir * len, ay); c.lineTo(ax + dir * len * 0.2, ay - 7); c.lineTo(ax + dir * len * 0.2, ay + 7); c.closePath(); c.fill();
      }
      // graphs: q_A against moves (left), and the chance of each q_A (right)
      var gy = topH + 14, gh = h - gy - 26, gw1 = narrow ? w - 40 - 96 : (w - 24) * 0.62, gx = 40;
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw1, gy + gh); c.stroke();
      c.fillStyle = C.muted; c.font = '10px ' + SANS; c.textAlign = 'right'; c.fillText(String(E.q), gx - 4, gy + 8); c.fillText('0', gx - 4, gy + gh);
      c.save(); c.translate(12, gy + gh / 2); c.rotate(-Math.PI / 2); c.textAlign = 'center'; c.fillText('q', -3, 0); c.font = '8px ' + SANS; c.fillText('A', 3, 3); c.restore(); c.font = '10px ' + SANS;
      var tMax = Math.max(hist[hist.length - 1][0], 1) * 1.02;
      c.textAlign = 'left'; c.fillText('random moves →  ' + Math.round(tMax).toLocaleString('en-US'), gx + 4, gy + gh + 13);
      var yb = gy + gh - gh * E.best / E.q; c.setLineDash([4, 4]); c.strokeStyle = 'rgba(255,212,121,.6)'; c.beginPath(); c.moveTo(gx, yb); c.lineTo(gx + gw1, yb); c.stroke(); c.setLineDash([]);
      c.textAlign = 'left'; var lbl = 'most likely: ' + E.best, lw = c.measureText(lbl).width; c.fillStyle = 'rgba(6,17,26,.85)'; c.fillRect(gx + 3, yb - 15, lw + 6, 13); c.fillStyle = C.gold; c.fillText(lbl, gx + 6, yb - 5);
      c.strokeStyle = C.green; c.lineWidth = 1.8; c.beginPath();
      for (var i = 0; i < hist.length; i++) { var X = gx + gw1 * hist[i][0] / tMax, Y = gy + gh - gh * hist[i][1] / E.q; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }
      c.stroke();
      // distribution, drawn sideways next to the graph so the two share the q_A axis
      var dx0 = gx + gw1 + 12, dw = w - dx0 - 12; if (dw > 30) {
        var pm = E.prob(E.best);
        c.fillStyle = 'rgba(255,212,121,.22)'; c.strokeStyle = C.gold; c.lineWidth = 1.2; c.beginPath(); c.moveTo(dx0, gy + gh);
        for (var a = 0; a <= E.q; a++) c.lineTo(dx0 + dw * E.prob(a) / pm, gy + gh - gh * a / E.q);
        c.lineTo(dx0, gy); c.closePath(); c.fill(); c.stroke();
        var yc = gy + gh - gh * E.qA / E.q; c.fillStyle = C.green; c.beginPath(); c.arc(dx0 + dw * E.prob(E.qA) / pm, yc, 4, 0, TAU); c.fill();
        c.fillStyle = C.muted; c.textAlign = 'center'; c.fillText('chance', dx0 + dw / 2, gy + gh + 13);
      }
    }
    var rdN = 0;
    L.loop(function () {
      if (!paused) {
        var p = PRE[pre], per = (p[0] + p[1]) * [0.02, 0.1, 0.5, 2][speed - 1];
        if (pre === 'tiny') per = [0.05, 0.2, 1, 3][speed - 1];
        var steps = Math.max(1, Math.round(per)); E.step(steps); hist.push([E.moves, E.qA]);
        if (hist.length > 1500) hist = hist.filter(function (_, i) { return i % 2 === 0 || i === hist.length - 1; });
        if (watching && pre !== 'tiny' && Math.abs(E.qA - E.best) <= 5) { watching = false; win('flow', 'Energy flowed from A to B until A held ' + E.qA + ' quanta' + ', near the most likely ' + E.best + '.', wrap.querySelector('.lab-view')); }
      }
      drawE();
      if (rdN++ % 6 === 0) {
        dl(rd, [['q<sub>A</sub> / q<sub>B</sub>', E.qA + ' / ' + (E.q - E.qA)], ['Most likely q<sub>A</sub>', E.best],
          ['Arrangements now', sciLn(E.lnTot[E.qA])], ['At the most likely split', sciLn(E.lnMax)],
          ['Chance to find all quanta in A', sciLn(E.lnTot[E.q] - E.lnAll)]]);
      }
    }, wrap);
  })();

  /* =========================================================================================
     4. Maxwell's demon: the game and the information ledger
     ========================================================================================= */
  (function () {
    var wrap = $('th3-demon'), cvD = $('th3-dc'); if (!wrap || !cvD) return;
    var g = L.canvas(cvD), c = g.c, dview = wrap.querySelector('.lab-view'), rd = $('th3-dread'), led = $('th3-ledger');
    var D, robot = false, hold = false, bestDT = 0, flashes = [], robotUsed = false;
    function make() { D = new P.Demon(40, Math.floor(Math.random() * 1e9) + 1); bestDT = 0; flashes = []; robotUsed = robot; }
    make();
    var btn = $('th3-door');
    function setHold(v) { hold = v; btn.setAttribute('aria-pressed', String(v)); btn.textContent = v ? 'Door open' : 'Hold to open the door'; }
    btn.addEventListener('pointerdown', function (e) { e.preventDefault(); setHold(true); btn.setPointerCapture && btn.setPointerCapture(e.pointerId); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) { btn.addEventListener(t, function () { setHold(false); }); });
    btn.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setHold(true); } });
    btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') setHold(false); });
    cvD.addEventListener('pointerdown', function (e) { e.preventDefault(); setHold(true); cvD.setPointerCapture && cvD.setPointerCapture(e.pointerId); });
    ['pointerup', 'pointercancel'].forEach(function (t) { cvD.addEventListener(t, function () { setHold(false); }); });
    cvD.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); setHold(true); } });
    cvD.addEventListener('keyup', function (e) { if (e.key === ' ') setHold(false); });
    var rb = $('th3-robot'); rb.addEventListener('change', function () { robot = rb.checked; if (robot) robotUsed = true; });
    $('th3-erase').addEventListener('click', function () {
      if (!D.bits) { L.toast(dview, 'The notebook is already empty.'); return; }
      var s = D.sides(), dT = Math.abs(s.TR - s.TL), b = D.bits; D.erase();
      var L2 = D.ledger(300);
      if (dT >= 20) win('bill', 'Erasing ' + b + ' bits dumped heat into the room. Total entropy change: +' + L.fmt(L2.total, 1) + ' k.', dview);
      else L.toast(dview, 'Erased ' + b + ' bits. Each one cost at least kT ln 2 of heat.');
    });
    $('th3-dnew').addEventListener('click', make);
    function speedCol(v2) { return ramp(HEAT, clamp(Math.sqrt(v2 / (2 * D.kT0)) / 1.7, 0, 1)); }
    function drawD() {
      g.fit(); var w = g.w, h = g.h; c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
      var s = D.sides(), bw = Math.min(w - 28, (h - 96) * 2), bh = bw / 2, bx = (w - bw) / 2, by = 46;
      // each side tinted by its temperature
      function tint(T) { return rgb(ramp(HEAT, clamp((T - 150) / 400, 0, 1)), 0.13); }
      c.fillStyle = s.nL ? tint(s.TL) : 'rgba(0,0,0,0)'; c.fillRect(bx, by, bw / 2, bh);
      c.fillStyle = s.nR ? tint(s.TR) : 'rgba(0,0,0,0)'; c.fillRect(bx + bw / 2, by, bw / 2, bh);
      c.strokeStyle = 'rgba(143,179,198,.5)'; c.lineWidth = 2; c.strokeRect(bx, by, bw, bh);
      // the wall and the door
      var open = robot || hold, g0 = by + bh * (0.5 - D.gap / 2), g1 = by + bh * (0.5 + D.gap / 2);
      c.strokeStyle = '#8fb3c6'; c.lineWidth = 4; c.beginPath(); c.moveTo(bx + bw / 2, by); c.lineTo(bx + bw / 2, g0); c.moveTo(bx + bw / 2, g1); c.lineTo(bx + bw / 2, by + bh); c.stroke();
      if (!open) { c.strokeStyle = C.gold; c.shadowColor = C.gold; c.shadowBlur = 8; c.beginPath(); c.moveTo(bx + bw / 2, g0); c.lineTo(bx + bw / 2, g1); c.stroke(); c.shadowBlur = 0; }
      else { c.strokeStyle = 'rgba(255,212,121,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + bw / 2, g0); c.lineTo(bx + bw / 2 + 10, g0 - 8); c.stroke(); }
      // the demon (a small watchful eye above the door)
      var ex = bx + bw / 2, ey = by - 16; c.fillStyle = robot ? C.green : C.pink; c.beginPath(); c.ellipse(ex, ey, 13, 8, 0, 0, TAU); c.fill();
      c.fillStyle = C.bg; c.beginPath(); c.arc(ex + Math.sin(performance.now() / 500) * (reduced ? 0 : 4), ey, 4, 0, TAU); c.fill();
      c.fillStyle = robot ? C.green : C.pink; c.font = '600 11px ' + SANS; c.textAlign = 'center'; c.fillText(robot ? 'robot demon' : 'you are the demon', ex, ey - 13);
      // molecules
      var rr = clamp(bw / 140, 2.5, 5);
      for (var i = 0; i < D.M; i++) {
        var v2 = D.vx[i] * D.vx[i] + D.vy[i] * D.vy[i], col = speedCol(v2), X = bx + D.x[i] / 2 * bw, Y = by + bh - D.y[i] * bh;
        c.fillStyle = rgb(col, 0.25); c.beginPath(); c.arc(X, Y, rr * 2.2, 0, TAU); c.fill();
        c.fillStyle = rgb(col); c.beginPath(); c.arc(X, Y, rr, 0, TAU); c.fill();
      }
      flashes = flashes.filter(function (f) { return performance.now() - f.t < 600; });
      flashes.forEach(function (f) { var a = 1 - (performance.now() - f.t) / 600; c.strokeStyle = 'rgba(255,212,121,' + a + ')'; c.lineWidth = 2; c.beginPath(); c.arc(bx + bw / 2, by + bh / 2, 8 + 20 * (1 - a), 0, TAU); c.stroke(); });
      // thermometers
      function therm(x, T, n, label) {
        c.fillStyle = C.muted; c.font = '11px ' + SANS; c.textAlign = 'center'; c.fillText(label, x, by + bh + 16);
        c.fillStyle = n ? rgb(ramp(HEAT, clamp((T - 150) / 400, 0, 1))) : C.muted; c.font = '700 15px ' + SANS;
        c.fillText(n ? Math.round(T) + ' K' : 'empty', x, by + bh + 34);
      }
      therm(bx + bw / 4, s.TL, s.nL, 'left side · ' + s.nL + ' molecules'); therm(bx + 3 * bw / 4, s.TR, s.nR, 'right side · ' + s.nR + ' molecules');
      return s;
    }
    var rdN = 0;
    L.loop(function (dt) {
      var before = D.passed;
      D.open = hold; for (var k = 0; k < 6; k++) D.step(0.004 * (reduced ? 0.7 : 1), robot);
      if (D.passed > before) flashes.push({ t: performance.now() });
      var s = drawD();
      if (s.nL && s.nR) { var dT = Math.abs(s.TR - s.TL); bestDT = Math.max(bestDT, dT); if (dT >= 40 && !robotUsed) win('demon', 'A ' + Math.round(dT) + ' K difference, made by sorting molecules!', dview); }
      if (rdN++ % 6 === 0) {
        var Lg = D.ledger(300);
        dl(rd, [['Left / right', (s.nL ? Math.round(s.TL) + ' K' : '—') + ' / ' + (s.nR ? Math.round(s.TR) + ' K' : '—')],
          ['Difference', s.nL && s.nR ? Math.round(Math.abs(s.TR - s.TL)) + ' K' : '—'], ['Molecules let through', D.passed]]);
        led.innerHTML =
          '<tr><th scope="row">Gas entropy change (sorting)</th><td>' + (Lg.dSgas < 0 ? '−' : '+') + L.fmt(Math.abs(Lg.dSgas), 2) + ' k</td></tr>' +
          '<tr><th scope="row">Notebook: ' + Lg.bits + ' bits × ln 2</th><td>+' + L.fmt(Lg.memory, 2) + ' k</td></tr>' +
          '<tr><th scope="row">Already erased: ' + Lg.erased + ' bits, heat into the room ≥ ' + (Lg.erased ? sciLn(Math.log(Lg.joules)) : '0') + ' J</th><td>+' + L.fmt(Lg.paid, 2) + ' k</td></tr>' +
          '<tr class="th3-tot"><th scope="row">Total (never below zero)</th><td>' + (Lg.total < -1e-9 ? '−' : '+') + L.fmt(Math.abs(Lg.total), 2) + ' k</td></tr>';
      }
    }, wrap);
  })();
})();
