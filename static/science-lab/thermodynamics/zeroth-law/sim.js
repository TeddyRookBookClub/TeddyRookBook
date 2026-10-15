/* Temperature and the Zeroth Law: the page. Runs the thermal-contact simulation (blocks, thermometer, graph, ledger,
   missions), the 2-D gas, the temperature scales and the touch test. The models live in physics.js (window.ThermoZeroth). */
(function () {
  'use strict';
  var LAB = window.TRBLab, Z = window.ThermoZeroth;
  var root = document.getElementById('th1-lab');
  if (!root || !LAB || !Z) return;
  function $(id) { return document.getElementById(id); }
  var fmt = LAB.fmt, reduced = LAB.reduced, M = Z.MATERIALS;
  var ID = ['#63e6be', '#f9a8d4', '#b8a6ff'], NAMES = ['A', 'B', 'C'];
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.22)', red: '#ff8787', gold: '#ffd479', blue: '#74c0fc', green: '#63e6be', pink: '#f9a8d4', bg: '#06111a' };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ---------- colors: cold #74c0fc → violet-gray → hot #ff8787 → #ffd479 ----------
  var STOPS = [[0, [116, 192, 252]], [40, [150, 140, 205]], [70, [255, 135, 135]], [100, [255, 212, 121]]];
  function trgb(T) {
    T = clamp(T, 0, 100);
    for (var i = 1; i < STOPS.length; i++) if (T <= STOPS[i][0]) { var a = STOPS[i - 1], b = STOPS[i], f = (T - a[0]) / (b[0] - a[0]); return [lerp(a[1][0], b[1][0], f), lerp(a[1][1], b[1][1], f), lerp(a[1][2], b[1][2], f)]; }
    return STOPS[STOPS.length - 1][1];
  }
  function tcol(T, alpha, k) { var c = trgb(T), m = k === undefined ? 1 : k; return 'rgba(' + Math.round(c[0] * m) + ',' + Math.round(c[1] * m) + ',' + Math.round(c[2] * m) + ',' + (alpha === undefined ? 1 : alpha) + ')'; }

  function fmtTime(t) {
    if (t < 60) return fmt(t, t < 10 ? 1 : 0) + ' s';
    if (t < 3600) { var m = Math.floor(t / 60), s = Math.floor(t - m * 60); return m + ' min ' + (s < 10 ? '0' : '') + s + ' s'; }
    var h = Math.floor(t / 3600), mm = Math.floor((t - h * 3600) / 60); return h + ' h ' + (mm < 10 ? '0' : '') + mm + ' min';
  }
  function fmtE(e) { var a = Math.abs(e); return a >= 1000 ? fmt(e / 1000, a >= 1e5 ? 0 : 2) + ' kJ' : fmt(e, a >= 100 ? 0 : 1) + ' J'; }
  function fmtW(p) { var a = Math.abs(p); return a >= 100 ? fmt(p, 0) + ' W' : a >= 1 ? fmt(p, 1) + ' W' : fmt(p, 3) + ' W'; }

  // ======================================================================= the main simulation
  var view = $('th1-view'), cv = $('th1-cv'), K = LAB.canvas(cv), ctx = K.c, hud = $('th1-hud');
  var ui = LAB.store('thermo-zeroth-ui');
  var PRESETS = {
    hot: [{ mat: 'copper', m: 1, T: 90 }, { mat: 'copper', m: 1, T: 10 }],
    water: [{ mat: 'iron', m: 1, T: 90 }, { mat: 'water', m: 1, T: 20 }],
    three: [{ mat: 'aluminum', m: 1, T: 85 }, { mat: 'granite', m: 1.5, T: 15 }, { mat: 'water', m: 0.5, T: 50 }],
    race: [{ mat: 'copper', m: 1, T: 20 }, { mat: 'iron', m: 2, T: 95 }, { mat: 'wood', m: 1, T: 20 }]
  };
  var NOTES = {
    hot: 'Two equal copper blocks, 90 °C and 10 °C. Press Touch.',
    water: 'A kilogram of iron at 90 °C and a kilogram of water at 20 °C. Guess where they meet, then press Touch.',
    three: 'Aluminum, granite and water at three temperatures. Granite is slow: watch the clock.',
    race: 'A hot iron block between copper and wood, both at 20 °C. Which side warms first?'
  };
  var model = new Z.Contact([]);
  var S = {
    pre: 'hot', spec: [], third: { mat: 'wood', m: 1, T: 50 }, nb: 2, sel: 0,
    want: false, slide: 0, paused: false, speed: 'auto', warp: 1, micro: false,
    hist: [], run: null, zr: null, eqShown: false, uiClock: 0, t: 0,
    drag: null, probeX: 0, probeY: 0, probeInit: false, sparks: [], hover: -1
  };
  var el = {
    presets: $('th1-presets'), touch: $('th1-touch'), nb: $('th1-nb'), tabs: $('th1-tabs'), mat: $('th1-mat'), m: $('th1-m'), mo: $('th1-m-o'), t: $('th1-t'), to: $('th1-t-o'),
    probe: $('th1-probe'), guess: $('th1-guess'), micro: $('th1-micro'), speed: $('th1-speed'), pause: $('th1-pause'), reset: $('th1-reset'),
    r: [$('th1-r0'), $('th1-r1'), $('th1-r2')], rp: $('th1-rp'), rq: $('th1-rq'), rf: $('th1-rf'), rt: $('th1-rt')
  };

  // ---------- missions ----------
  var MISSIONS = [
    { id: 'touch', title: 'First contact', goal: 'Touch two blocks that start at least 20 °C apart and wait until they reach the same temperature.' },
    { id: 'average', title: 'Right in the middle', goal: 'Two blocks of the same material and the same mass: show that they meet exactly halfway.' },
    { id: 'zeroth', title: 'The zeroth law', goal: 'Let the thermometer settle in one block, then in another: get the same reading in both.' },
    { id: 'stubborn', title: 'Stubborn water', goal: 'Equal masses of water and something else: the water’s temperature changes less than a quarter as much.' },
    { id: 'predict', title: 'Call it', goal: 'Type a guess before you press Touch, with different materials or masses, and land within 1 °C.' },
    { id: 'three', title: 'Three-way peace', goal: 'Bring three blocks of three different materials, starting at three temperatures, to one temperature.' },
    { id: 'race', title: 'Warm race', goal: 'Hot block in the middle, equal cold masses on each side: make one side warm 10 °C while the other has warmed less than a third as much.' }
  ];
  var PICK = {
    touch: ['hot', 'Press Touch and watch the arrow.'], average: ['hot', 'Two equal copper blocks: press Touch.'],
    zeroth: ['hot', 'Touch, wait for equilibrium, then put the thermometer in A and then in B.'],
    stubborn: ['water', 'Press Touch and compare how far each temperature moves.'],
    predict: ['water', 'Type your guess in the box first, then press Touch.'], three: ['three', 'Press Touch, then wait. Try “1 h/s” if you’re impatient.'],
    race: ['race', 'Press Touch. Then try other materials on the sides.']
  };
  var MS = LAB.missions($('th1-missions'), 'thermo-zeroth', MISSIONS, function (id) { var p = PICK[id]; if (!p) return; loadPreset(p[0]); toastQ = []; toastAt = -10; say(p[1]); });
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.8) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  function win(id, text) { if (MS.done(id)) { var m = MISSIONS.filter(function (x) { return x.id === id; })[0]; say('✓ ' + m.title + ': ' + text); celebrate(); } }
  var burst = [];
  function celebrate() {
    if (reduced) return;
    for (var i = 0; i < 40; i++) { var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 160; burst.push({ x: K.w / 2, y: K.h * 0.3, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: 1, c: [C.green, C.gold, C.pink, C.red][i % 4] }); }
  }

  // ---------- setup ----------
  function loadPreset(id) {
    S.pre = PRESETS[id] ? id : 'hot'; ui.set('pre', S.pre);
    S.spec = PRESETS[S.pre].map(function (b) { return { mat: b.mat, m: b.m, T: b.T }; });
    S.nb = S.spec.length; if (S.nb === 2 && !S.third) S.third = { mat: 'wood', m: 1, T: 50 };
    S.sel = 0; rebuild(); syncPanel();
    var bs = el.presets.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-pre') === S.pre ? 'true' : 'false');
  }
  function activeSpec() { return S.spec.slice(0, S.nb); }
  function rebuild() {
    var at = model.probe.at; model.setBlocks(activeSpec()); model.applyTouch(false);
    if (at >= S.nb) at = -1; model.dipProbe(at); model.resetLedger();
    S.want = false; S.slide = 0; S.hist = []; S.run = null; S.eqShown = false; S.sparks = []; S.zr = null;
    pushHist(); syncTouchBtn(); syncProbe();
  }
  function setNb(n) {
    if (n === S.nb) return;
    if (n === 3) { if (S.spec.length < 3) S.spec.push(S.third || { mat: 'wood', m: 1, T: 50 }); }
    else if (S.spec.length > 2) { S.third = S.spec[2]; S.spec = S.spec.slice(0, 2); }
    S.nb = n; if (S.sel >= n) S.sel = n - 1; S.pre = null; markPreset(); rebuild(); syncPanel();
  }
  function markPreset() { var bs = el.presets.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-pre') === S.pre ? 'true' : 'false'); }
  function editSel(field, v) { var b = S.spec[S.sel]; if (!b) return; b[field] = v; S.pre = null; markPreset(); rebuild(); }
  function syncPanel() {
    var b = S.spec[S.sel];
    el.mat.value = b.mat; el.m.value = b.m; el.mo.textContent = fmt(b.m, 1) + ' kg'; el.t.value = b.T; el.to.textContent = Math.round(b.T) + ' °C';
    var tb = el.tabs.querySelectorAll('button'); for (var i = 0; i < tb.length; i++) { tb[i].setAttribute('aria-pressed', i === S.sel ? 'true' : 'false'); tb[i].hidden = i >= S.nb; }
    var nb = el.nb.querySelectorAll('button'); for (i = 0; i < nb.length; i++) nb[i].setAttribute('aria-pressed', +nb[i].getAttribute('data-nb') === S.nb ? 'true' : 'false');
    var pb = el.probe.querySelectorAll('button'); for (i = 0; i < pb.length; i++) pb[i].hidden = +pb[i].getAttribute('data-p') >= S.nb;
    root.querySelectorAll('.th1-rc').forEach(function (x) { x.hidden = S.nb < 3; });
    syncProbe();
  }
  function syncProbe() { var pb = el.probe.querySelectorAll('button'); for (var i = 0; i < pb.length; i++) pb[i].setAttribute('aria-pressed', +pb[i].getAttribute('data-p') === model.probe.at ? 'true' : 'false'); }
  function syncTouchBtn() { el.touch.textContent = S.want ? 'Pull apart ◂▸' : 'Touch ▸◂'; el.touch.setAttribute('aria-pressed', S.want ? 'true' : 'false'); }
  function setTouch(on) {
    if (on === S.want) return;
    S.want = on;
    if (on) {
      var g = parseFloat(el.guess.value);
      S.run = { T0: activeSpec().map(function (b, i) { return model.blockT(i); }), spec: activeSpec().map(function (b) { return { mat: b.mat, m: b.m }; }), guess: isFinite(g) ? g : null, eq: false, t0: model.time };
      if (reduced) { S.slide = 1; model.applyTouch(true); }
    } else model.applyTouch(false);
    S.eqShown = false; syncTouchBtn();
  }
  function setProbe(at) { at = at >= S.nb ? -1 : at; model.dipProbe(at); syncProbe(); }
  function setPaused(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
  function setSpeed(s) {
    S.speed = s; ui.set('speed', s);
    var bs = el.speed.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-s') === s ? 'true' : 'false');
  }

  el.presets.addEventListener('click', function (e) { var b = e.target.closest('button[data-pre]'); if (!b) return; loadPreset(b.getAttribute('data-pre')); toastQ = []; toastAt = -10; say(NOTES[S.pre]); });
  el.touch.addEventListener('click', function () { setTouch(!S.want); });
  el.nb.addEventListener('click', function (e) { var b = e.target.closest('button[data-nb]'); if (b) setNb(+b.getAttribute('data-nb')); });
  el.tabs.addEventListener('click', function (e) { var b = e.target.closest('button[data-b]'); if (!b) return; S.sel = +b.getAttribute('data-b'); syncPanel(); });
  el.mat.addEventListener('change', function () { editSel('mat', el.mat.value); syncPanel(); });
  el.m.addEventListener('input', function () { editSel('m', +el.m.value); el.mo.textContent = fmt(+el.m.value, 1) + ' kg'; });
  el.t.addEventListener('input', function () { editSel('T', +el.t.value); el.to.textContent = el.t.value + ' °C'; });
  el.probe.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b) setProbe(+b.getAttribute('data-p')); });
  el.micro.addEventListener('change', function () { S.micro = el.micro.checked; ui.set('micro', S.micro); });
  el.speed.addEventListener('click', function (e) { var b = e.target.closest('button[data-s]'); if (b) setSpeed(b.getAttribute('data-s')); });
  el.pause.addEventListener('click', function () { setPaused(!S.paused); });
  el.reset.addEventListener('click', function () { if (S.pre) loadPreset(S.pre); else rebuild(); });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === ' ' || k === 'Spacebar') setTouch(!S.want);
    else if (k === 't' || k === 'T') setProbe(model.probe.at + 1 >= S.nb ? -1 : model.probe.at + 1);
    else if (k === 'm' || k === 'M') { S.micro = !S.micro; el.micro.checked = S.micro; }
    else if (k === 'p' || k === 'P') setPaused(!S.paused);
    else if (k >= '1' && k <= '3' && +k <= S.nb) { S.sel = +k - 1; syncPanel(); }
    else if (k === 'ArrowUp' || k === 'ArrowRight') { editSel('T', clamp(S.spec[S.sel].T + 5, 0, 100)); syncPanel(); }
    else if (k === 'ArrowDown' || k === 'ArrowLeft') { editSel('T', clamp(S.spec[S.sel].T - 5, 0, 100)); syncPanel(); }
    else used = false;
    if (used) e.preventDefault();
  });

  // ---------- layout ----------
  var R = {};
  function layout() {
    var w = K.w, h = K.h; R.w = w; R.h = h; R.wide = w >= 620;
    var top = R.wide ? 64 : 62, botH = R.wide ? Math.round(clamp(h * 0.36, 170, 250)) : Math.round(clamp(h * 0.42, 200, 270));
    R.bench = { x: 14, y: top, w: w - 28, h: h - top - botH - 18 };
    R.benchY = R.bench.y + R.bench.h - 26;        // where the blocks stand
    if (R.wide) {
      var gw = Math.round((w - 40) * 0.56);
      R.graph = { x: 14, y: h - botH - 8, w: gw, h: botH };
      R.led = { x: 26 + gw, y: h - botH - 8, w: w - 40 - gw, h: botH };
    } else {
      var gh = Math.round(botH * 0.5);
      R.graph = { x: 10, y: h - botH - 8, w: w - 20, h: gh - 4 };
      R.led = { x: 10, y: h - botH - 8 + gh + 4, w: w - 20, h: botH - gh - 4 };
    }
    // the thermometer's size, and its home in the air
    R.thH = clamp(R.bench.h * 0.62, 90, 170); R.thW = R.wide ? 12 : 10;
    R.airX = R.bench.x + R.bench.w - 22; R.airY = R.benchY - 4;
  }
  // where each block sits now (px): x of the front face's left edge, side, y of the bottom
  function blockRects() {
    var bl = model.blocks, n = bl.length, out = [], i;
    if (!n) return out;
    var sumL = 0, maxL = 0; for (i = 0; i < n; i++) { sumL += bl[i].L; maxL = Math.max(maxL, bl[i].L); }
    var avail = R.bench.w - 70, gapMax = R.wide ? 46 : 26;
    var s = Math.min((avail - gapMax * (n - 1)) / (sumL * 1.12), (R.benchY - R.bench.y - 40 - (S.micro ? (R.wide ? 90 : 110) : 0)) / (maxL * 1.22), R.wide ? 3000 : 2000);
    var gap = gapMax * (1 - ease(S.slide)), total = sumL * s + gap * (n - 1);
    var x = R.bench.x + (R.bench.w - 40 - total) / 2;
    for (i = 0; i < n; i++) { var side = bl[i].L * s; out.push({ x: x, side: side, y: R.benchY, dx: side * 0.26, dy: side * 0.2 }); x += side + gap; }
    R.s = s; return out;
  }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // ---------- history ----------
  function pushHist() {
    var T = []; for (var i = 0; i < model.blocks.length; i++) T.push(model.blockT(i));
    S.hist.push({ t: model.time, T: T, p: model.probe.T, in: model.probe.at >= 0 });
    if (S.hist.length > 900) { var keep = [S.hist[0]]; for (var j = 1; j < S.hist.length - 1; j += 2) keep.push(S.hist[j]); keep.push(S.hist[S.hist.length - 1]); S.hist = keep; }
  }

  // ---------- pointer: choose blocks, drag the thermometer ----------
  function pt(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function blockAt(p, rects) { for (var i = rects.length - 1; i >= 0; i--) { var b = rects[i]; if (p.x >= b.x - 4 && p.x <= b.x + b.side + b.dx + 4 && p.y >= b.y - b.side - b.dy - 8 && p.y <= b.y + 4) return i; } return -1; }
  function onProbe(p) { return Math.abs(p.x - S.probeX) < 22 && p.y > S.probeY - R.thH - 12 && p.y < S.probeY + 18; }
  cv.addEventListener('pointerdown', function (e) {
    var p = pt(e);
    if (onProbe(p)) { S.drag = { x: p.x, y: p.y }; try { cv.setPointerCapture(e.pointerId); } catch (err) { } e.preventDefault(); return; }
    var bi = blockAt(p, blockRects()); if (bi >= 0) { S.sel = bi; syncPanel(); }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pt(e);
    if (S.drag) { S.drag.x = p.x; S.drag.y = p.y; return; }
    cv.style.cursor = onProbe(p) ? 'grab' : blockAt(p, blockRects()) >= 0 ? 'pointer' : 'default';
  });
  function endDrag(e) {
    if (!S.drag) return;
    var p = S.drag, bi = blockAt({ x: p.x, y: p.y + 10 }, blockRects());
    if (bi < 0) { var rr = blockRects(); for (var i = 0; i < rr.length; i++) if (p.x >= rr[i].x && p.x <= rr[i].x + rr[i].side + rr[i].dx && p.y < rr[i].y) bi = i; }
    setProbe(bi); S.drag = null; void e;
  }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);

  // ---------- missions: checks ----------
  function cellsSpread() { var lo = Infinity, hi = -Infinity; for (var i = 0; i < model.T.length; i++) { lo = Math.min(lo, model.T[i]); hi = Math.max(hi, model.T[i]); } return hi - lo; }
  function checkMissions() {
    var run = S.run, i, n = model.blocks.length;
    // the thermometer: settled readings in two blocks
    var pc = model.probeCell();
    if (pc >= 0 && Math.abs(model.probe.T - model.T[pc]) < 0.05) {
      var b = model.probe.at, r = model.probe.T;
      if (S.zr && S.zr.block !== b && S.zr.block < n && Math.abs(S.zr.reading - r) < 0.3 && Math.abs(model.blockT(S.zr.block) - S.zr.reading) < 0.3) {
        win('zeroth', NAMES[S.zr.block] + ' and ' + NAMES[b] + ' both read ' + fmt(r, 1) + ' °C, so they’re in equilibrium with each other.');
      }
      S.zr = { block: b, reading: r };
    }
    if (!run || !S.want || S.slide < 1) return;
    var spread0 = Math.max.apply(null, run.T0) - Math.min.apply(null, run.T0);
    // the race, while it runs
    if (n === 3 && !MS.isDone('race')) {
      var sp = run.spec, okCfg = run.T0[1] >= Math.max(run.T0[0], run.T0[2]) + 30 && Math.abs(sp[0].m - sp[2].m) < 0.01 && sp[0].mat !== sp[2].mat && Math.abs(run.T0[0] - run.T0[2]) <= 1;
      if (okCfg) {
        var dA = model.blockT(0) - run.T0[0], dC = model.blockT(2) - run.T0[2], lead = Math.max(dA, dC), lag = Math.min(dA, dC);
        if (lead >= 10 && lead >= 3 * Math.max(0.01, lag)) { var wi = dA > dC ? 0 : 2; win('race', M[sp[wi].mat].name + ' wins: warmed ' + fmt(lead, 1) + ' °C while ' + M[sp[2 - wi].mat].name.toLowerCase() + ' warmed ' + fmt(Math.max(0, lag), 1) + ' °C.'); }
      }
    }
    if (run.eq || cellsSpread() > 0.25) return;
    run.eq = true;
    var Tf = model.finalT(), sp2 = run.spec, msg = 'Equilibrium: everything at ' + fmt(Tf, 1) + ' °C after ' + fmtTime(model.time - run.t0) + '.';
    var any = false;
    if (spread0 >= 20) { if (MS.done('touch')) { say('✓ First contact: ' + msg.replace('Equilibrium: ', '')); celebrate(); any = true; } }
    if (n === 2 && sp2[0].mat === sp2[1].mat && Math.abs(sp2[0].m - sp2[1].m) < 0.01 && spread0 >= 20) { if (!MS.isDone('average')) { win('average', 'started at ' + fmt(run.T0[0], 0) + ' and ' + fmt(run.T0[1], 0) + ' °C, met at ' + fmt(Tf, 1) + ' °C.'); any = true; } }
    if (n === 2 && Math.abs(sp2[0].m - sp2[1].m) < 0.01 && spread0 >= 20 && (sp2[0].mat === 'water') !== (sp2[1].mat === 'water')) {
      var wI = sp2[0].mat === 'water' ? 0 : 1, dw = Math.abs(Tf - run.T0[wI]), dO = Math.abs(Tf - run.T0[1 - wI]);
      if (dw < 0.25 * dO && !MS.isDone('stubborn')) { win('stubborn', 'the water moved ' + fmt(dw, 1) + ' °C, the ' + M[sp2[1 - wI].mat].name.toLowerCase() + ' ' + fmt(dO, 1) + ' °C.'); any = true; }
    }
    if (run.guess !== null) {
      var diff = Math.abs(run.guess - Tf), nontriv = n >= 2 && (sp2.some(function (b) { return b.mat !== sp2[0].mat; }) || sp2.some(function (b) { return Math.abs(b.m - sp2[0].m) > 0.05; }));
      if (diff <= 1 && nontriv && spread0 >= 20 && !MS.isDone('predict')) { win('predict', 'you said ' + fmt(run.guess, 1) + ' °C; it ended at ' + fmt(Tf, 1) + ' °C.'); any = true; }
      else { say((diff <= 1 ? 'Nice: ' : 'Your guess: ') + fmt(run.guess, 1) + ' °C. It ended at ' + fmt(Tf, 1) + ' °C' + (diff <= 1 ? '.' : '. Try Σ m c T ÷ Σ m c.')); any = true; }
    }
    if (n === 3) {
      var mats = sp2.map(function (b) { return b.mat; }), dif = mats[0] !== mats[1] && mats[1] !== mats[2] && mats[0] !== mats[2];
      var apart = Math.abs(run.T0[0] - run.T0[1]) >= 10 && Math.abs(run.T0[1] - run.T0[2]) >= 10 && Math.abs(run.T0[0] - run.T0[2]) >= 10;
      if (dif && apart && !MS.isDone('three')) { win('three', 'three materials, one temperature: ' + fmt(Tf, 1) + ' °C after ' + fmtTime(model.time - run.t0) + '.'); any = true; }
    }
    if (!any && !S.eqShown) say(msg);
    S.eqShown = true;
  }

  // ---------- the frame ----------
  var lastSpark = 0;
  function frame(dt) {
    if (!S.probeInit) { layout(); S.probeX = R.airX; S.probeY = R.airY; S.probeInit = true; }
    pumpToasts();
    // slide the blocks together or apart
    var tgt = S.want ? 1 : 0;
    if (S.slide !== tgt) {
      S.slide = reduced ? tgt : clamp(S.slide + (tgt > S.slide ? 1 : -1) * dt * 2.2, 0, 1);
      if (S.slide === 1 && S.want && !model.touch) { model.applyTouch(true); say(S.run && S.run.guess !== null ? 'Touching. Your guess: ' + fmt(S.run.guess, 1) + ' °C.' : 'Touching: heat flows from hot to cold.'); }
    }
    // the clock
    var target;
    if (S.speed === 'auto') {
      var sp = model.spread(), rate = model.maxRate();
      if (sp > 0.004 && rate > 1e-9) target = clamp(sp / rate / 2.0, 1, 40000); else target = S.warp;
      var lw = Math.log(S.warp), lt = Math.log(target);
      S.warp = Math.exp(lw + (lt - lw) * Math.min(1, dt * (lt < lw ? 4 : 1.2)));
    } else S.warp = +S.speed;
    if (!S.paused) {
      var simDt = dt * S.warp; model.step(simDt, Math.max(0.02, Math.min(2, simDt / 20)));
      pushHist(); checkMissions();
    }
    S.t += dt;
    draw(dt);
    S.uiClock -= dt; if (S.uiClock <= 0) { S.uiClock = 0.2; readouts(); }
  }
  function readouts() {
    for (var i = 0; i < 3; i++) if (i < model.blocks.length) el.r[i].textContent = fmt(model.blockT(i), 2) + ' °C';
    var pin = model.probe.at;
    el.rp.textContent = fmt(model.probe.T, 2) + ' °C' + (pin >= 0 ? ' (in ' + NAMES[pin] + ')' : ' (air)');
    var f = model.flows(), tot = 0; for (var j = 0; j < f.length; j++) tot += Math.abs(f[j]);
    el.rq.textContent = model.touch ? fmtW(tot) : '0 W (apart)';
    el.rf.textContent = fmt(model.predictFinal(), 2) + ' °C';
    el.rt.textContent = fmtTime(model.time);
    var hs = '⏱ <b>' + fmtTime(model.time) + '</b> · ' + (S.paused ? 'paused' : (S.warp < 1.5 ? 'real time' : '×' + (S.warp < 100 ? fmt(S.warp, 0) : Math.round(S.warp).toLocaleString('en-US')))) + (S.speed === 'auto' ? ' auto' : '') + '<br>';
    if (!S.want) hs += 'Apart. Press <b>Touch</b> or Space.';
    else if (!model.touch) hs += 'Pushing together…';
    else if (cellsSpread() < 0.25) hs += '<span class="th1-eq">Equilibrium at ' + fmt(model.finalT(), 2) + ' °C</span>';
    else hs += '<span class="th1-flow">Heat flowing: ' + fmtW(tot) + '</span>';
    hud.innerHTML = hs;
  }

  // ---------- drawing ----------
  function draw(dt) {
    var w = K.w, h = K.h; if (w !== R.w || h !== R.h) layout();
    ctx.clearRect(0, 0, w, h);
    var rects = blockRects();
    drawBench(rects);
    var flows = model.flows();
    for (var i = 0; i < rects.length; i++) drawBlock(i, rects[i]);
    drawProbe(rects, dt);
    drawLabels(rects);
    if (model.touch) drawFlows(rects, flows, dt);
    if (S.micro && rects.length >= 2) drawMicro(rects, flows);
    drawGraph(); drawLedger();
    drawBurst(dt);
  }
  function drawBench(rects) {
    var y = R.benchY;
    var g = ctx.createLinearGradient(0, y, 0, y + 24); g.addColorStop(0, 'rgba(120,170,200,.22)'); g.addColorStop(1, 'rgba(120,170,200,0)');
    ctx.fillStyle = g; ctx.fillRect(R.bench.x, y, R.bench.w, 24);
    ctx.strokeStyle = 'rgba(160,200,225,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(R.bench.x, y + 0.5); ctx.lineTo(R.bench.x + R.bench.w, y + 0.5); ctx.stroke();
    void rects;
  }
  function texture(mat, x, y, wd, ht) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, wd, ht); ctx.clip();
    var i;
    if (mat === 'wood') {
      ctx.strokeStyle = 'rgba(60,30,10,.28)'; ctx.lineWidth = 1.2;
      for (i = 0; i < 7; i++) { var yy = y + ht * (i + 0.5) / 7; ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x + wd * 0.3, yy - 4, x + wd * 0.6, yy + 5, x + wd, yy - 2); ctx.stroke(); }
    } else if (mat === 'granite') {
      var seed = 11; for (i = 0; i < Math.min(140, wd * ht / 60); i++) { seed = (seed * 16807) % 2147483647; var px = x + (seed % 1000) / 1000 * wd; seed = (seed * 16807) % 2147483647; var py = y + (seed % 1000) / 1000 * ht; ctx.fillStyle = i % 3 ? 'rgba(20,20,30,.28)' : 'rgba(255,255,255,.28)'; ctx.fillRect(px, py, 2, 2); }
    } else if (mat !== 'water') {
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1;
      for (i = 1; i < 10; i++) { var y2 = y + ht * i / 10; ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x + wd, y2); ctx.stroke(); }
    }
    ctx.restore();
  }
  function drawBlock(i, r) {
    var b = model.blocks[i], n = b.n, x = r.x, s = r.side, y0 = r.y - s, sw = s / n, j;
    var water = M[b.mat].stirred, Tavg = model.blockT(i);
    // glow
    var gl = ctx.createRadialGradient(x + s / 2, y0 + s / 2, s * 0.2, x + s / 2, y0 + s / 2, s * 1.05);
    gl.addColorStop(0, tcol(Tavg, Tavg > 55 ? 0.28 : 0.16)); gl.addColorStop(1, tcol(Tavg, 0));
    ctx.fillStyle = gl; ctx.fillRect(x - s * 0.5, y0 - s * 0.5, s * 2, s * 2);
    // top face (slices)
    for (j = 0; j < n; j++) {
      var T = model.T[b.start + j], x0 = x + j * sw;
      ctx.fillStyle = tcol(T, water ? 0.55 : 1, 1.08);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + sw + 0.6, y0); ctx.lineTo(x0 + sw + 0.6 + r.dx, y0 - r.dy); ctx.lineTo(x0 + r.dx, y0 - r.dy); ctx.closePath(); ctx.fill();
    }
    // right face: the last slice, darker
    ctx.fillStyle = tcol(model.T[b.start + n - 1], water ? 0.5 : 1, 0.62);
    ctx.beginPath(); ctx.moveTo(x + s, y0); ctx.lineTo(x + s + r.dx, y0 - r.dy); ctx.lineTo(x + s + r.dx, r.y - r.dy); ctx.lineTo(x + s, r.y); ctx.closePath(); ctx.fill();
    // front face
    for (j = 0; j < n; j++) { ctx.fillStyle = tcol(model.T[b.start + j], water ? 0.8 : 1, 0.88); ctx.fillRect(x + j * sw, y0, sw + 0.6, s); }
    texture(b.mat, x, y0, s, s);
    if (water) {   // a glass can: rim and ripples
      ctx.strokeStyle = 'rgba(220,240,255,.55)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + 0.75, y0 - r.dy * 0.15, s - 1.5, s + r.dy * 0.15 - 0.75);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
      for (j = 0; j < 3; j++) { var yy = y0 + s * (0.25 + j * 0.25), ph = S.t * 1.6 + j; ctx.beginPath(); for (var k = 0; k <= 12; k++) { var xx = x + 4 + (s - 8) * k / 12; var yv = yy + Math.sin(ph + k * 0.9) * (reduced ? 0 : 1.5); if (k) ctx.lineTo(xx, yv); else ctx.moveTo(xx, yv); } ctx.stroke(); }
    }
    // edges, and the selected block's outline
    ctx.strokeStyle = i === S.sel ? ID[i] : 'rgba(255,255,255,.28)'; ctx.lineWidth = i === S.sel ? 2 : 1;
    ctx.beginPath(); ctx.rect(x, y0, s, s); ctx.moveTo(x, y0); ctx.lineTo(x + r.dx, y0 - r.dy); ctx.lineTo(x + s + r.dx, y0 - r.dy); ctx.lineTo(x + s + r.dx, r.y - r.dy); ctx.lineTo(x + s, r.y); ctx.moveTo(x + s, y0); ctx.lineTo(x + s + r.dx, y0 - r.dy); ctx.stroke();
  }
  // labels: each block's temperature above it and its name below, moved apart when they would overlap
  function drawLabels(rects) {
    var big = R.wide ? 17 : 14, prevT = null, prevB = [null, null], firstLeft = Infinity;
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i], b = model.blocks[i], Tavg = model.blockT(i);
      ctx.textAlign = 'center'; ctx.font = '700 ' + big + 'px system-ui,sans-serif';
      var tt = fmt(Tavg, 1) + ' °C', tw = ctx.measureText(tt).width, cx = r.x + (r.side + r.dx) / 2, ty = r.y - r.side - r.dy - 10;
      if (model.probe.at === i && !S.drag && Math.abs(cx - S.probeX) < tw / 2 + R.thW) cx = Math.max(R.bench.x + tw / 2, S.probeX - R.thW - 6 - tw / 2);
      if (prevT && Math.abs(cx - prevT.cx) < (tw + prevT.w) / 2 + 6 && Math.abs(ty - prevT.y) < big + 2) ty = prevT.y - big - 4;
      ctx.fillStyle = tcol(Tavg, 1, 1.05); ctx.fillText(tt, cx, ty); prevT = { cx: cx, y: ty, w: tw };
      ctx.font = '600 ' + (R.wide ? 12 : 10.5) + 'px system-ui,sans-serif';
      var bt = NAMES[i] + ' · ' + M[b.mat].name + ' · ' + fmt(b.m, 1) + ' kg', bw = ctx.measureText(bt).width, bx = clamp(r.x + r.side / 2, R.bench.x + bw / 2, R.bench.x + R.bench.w - bw / 2), row = 0;
      if (prevB[0] && bx - bw / 2 < prevB[0] + 8) row = 1;
      if (row === 1 && prevB[1] && bx - bw / 2 < prevB[1] + 8) row = 0;
      prevB[row] = bx + bw / 2; firstLeft = Math.min(firstLeft, bx - bw / 2);
      ctx.fillStyle = ID[i]; ctx.fillText(bt, bx, r.y + 16 + row * 14);
    }
    if (firstLeft > R.bench.x + 250) { ctx.fillStyle = C.muted; ctx.font = '11px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillText('insulating bench · no heat lost to the air', R.bench.x + 4, R.benchY + 17); }
  }
  function drawFlows(rects, flows, dt) {
    for (var i = 0; i < flows.length; i++) {
      var a = rects[i], b = rects[i + 1], P = flows[i], mag = Math.abs(P);
      if (mag < 1e-4) continue;
      var bx = b.x, h2 = Math.min(a.side, b.side), cy = b.y - h2 * 0.5, dir = P > 0 ? 1 : -1;
      var len = clamp(18 + 9 * Math.log(1 + mag), 22, 70), th = clamp(3 + 2.2 * Math.log(1 + mag), 4, 16);
      var hot = P > 0 ? model.T[model.blocks[i].start + model.blocks[i].n - 1] : model.T[model.blocks[i + 1].start];
      var x0 = bx - dir * len / 2, x1 = bx + dir * len / 2;
      ctx.save(); ctx.shadowColor = tcol(hot); ctx.shadowBlur = reduced ? 0 : 14;
      var gr = ctx.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, tcol(hot, 0.95)); gr.addColorStop(1, 'rgba(116,192,252,.9)');
      ctx.fillStyle = gr; ctx.beginPath();
      ctx.moveTo(x0, cy - th / 2); ctx.lineTo(x1 - dir * th, cy - th / 2); ctx.lineTo(x1 - dir * th, cy - th); ctx.lineTo(x1 + dir * 2, cy); ctx.lineTo(x1 - dir * th, cy + th); ctx.lineTo(x1 - dir * th, cy + th / 2); ctx.lineTo(x0, cy + th / 2); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.font = '600 11px ui-monospace,Menlo,Consolas,monospace'; ctx.fillStyle = C.ink; ctx.textAlign = 'center';
      ctx.fillText(fmtW(mag), bx, cy + th + 14);
      // sparks
      if (!reduced) {
        S.sparks.length > 200 || (Math.random() < dt * (2 + 4 * Math.log(1 + mag)) && S.sparks.push({ x: bx - dir * h2 * 0.35, y: b.y - Math.random() * h2 * 0.9 - h2 * 0.05, v: dir * (25 + Math.random() * 30), life: 1, T: hot, lim: h2 * 0.35 }));
      }
    }
    for (var k = S.sparks.length - 1; k >= 0; k--) {
      var sp = S.sparks[k]; sp.x += sp.v * dt; sp.life -= dt * 0.9;
      if (sp.life <= 0) { S.sparks.splice(k, 1); continue; }
      ctx.fillStyle = tcol(lerp(20, sp.T, sp.life), sp.life * 0.9); ctx.beginPath(); ctx.arc(sp.x, sp.y, 2.2, 0, 7); ctx.fill();
    }
  }
  function drawProbe(rects, dt) {
    // where it should be
    var at = model.probe.at, tx, ty;
    if (S.drag) { tx = S.drag.x; ty = S.drag.y + R.thH * 0.15; }
    else if (at >= 0 && rects[at]) { var r = rects[at]; tx = r.x + r.side * 0.5 + r.dx * 0.5; ty = r.y - r.side * 0.45 - r.dy * 0.5; }
    else { tx = R.airX; ty = R.airY; }
    var k = S.drag || reduced ? 1 : Math.min(1, dt * 8);
    S.probeX += (tx - S.probeX) * k; S.probeY += (ty - S.probeY) * k;
    var x = S.probeX, yb = S.probeY, H = R.thH, W = R.thW, top = yb - H;
    var inBlock = at >= 0 && !S.drag && Math.abs(S.probeX - tx) < 2;
    if (inBlock) { ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, rects[at].y - rects[at].side - rects[at].dy * 0.5, W * 0.9, W * 0.35, 0, 0, 7); ctx.fill(); }
    // tube
    ctx.save();
    ctx.fillStyle = 'rgba(230,245,255,.16)'; ctx.strokeStyle = 'rgba(230,245,255,.7)'; ctx.lineWidth = 1.2;
    roundRect(x - W / 2, top, W, H - 6, W / 2); ctx.fill(); ctx.stroke();
    // liquid: 0–100 °C over the scale
    var Tp = model.probe.T, sc0 = yb - 14, sc1 = top + 10, ly = lerp(sc0, sc1, clamp(Tp / 100, 0, 1.04));
    ctx.fillStyle = C.red; ctx.fillRect(x - W * 0.18, ly, W * 0.36, yb - ly);
    ctx.beginPath(); ctx.arc(x, yb, W * 0.85, 0, 7); ctx.fillStyle = C.red; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.stroke();
    // ticks
    ctx.strokeStyle = 'rgba(230,245,255,.55)'; ctx.lineWidth = 1;
    for (var t = 0; t <= 100; t += 10) { var yy = lerp(sc0, sc1, t / 100); ctx.beginPath(); ctx.moveTo(x + W / 2, yy); ctx.lineTo(x + W / 2 + (t % 50 ? 3 : 6), yy); ctx.stroke(); }
    ctx.restore();
    // reading: at the top of the tube in the air, beside the bulb when it's dipped in a block
    ctx.font = '700 ' + (R.wide ? 13 : 12) + 'px ui-monospace,Menlo,Consolas,monospace';
    var txt = fmt(Tp, 1) + ' °C', tw = ctx.measureText(txt).width, ry = inBlock ? yb - 30 : top + 2, rx = inBlock ? x + W + 4 : x - W / 2 - 8 - tw;
    if (rx < 4) rx = x + W / 2 + 10; if (rx + tw + 6 > R.w - 4) rx = x - W - 8 - tw;
    ctx.fillStyle = 'rgba(6,17,26,.85)'; ctx.fillRect(rx - 3, ry, tw + 6, 18); ctx.strokeStyle = 'rgba(255,212,121,.5)'; ctx.lineWidth = 1; ctx.strokeRect(rx - 3, ry, tw + 6, 18);
    ctx.textAlign = 'left'; ctx.fillStyle = C.gold; ctx.fillText(txt, rx, ry + 13);
    if (at < 0 && !S.drag) { ctx.font = '11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'right'; ctx.fillText('drag me', x - W / 2 - 6, top + 34); }
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath(); }
  // ---------- the microscope ----------
  var atoms = null;
  function drawMicro(rects, flows) {
    var i = 0; // boundary between A and B, or the one with the most flow
    if (flows.length > 1 && Math.abs(flows[1]) > Math.abs(flows[0])) i = 1;
    var a = rects[i], b = rects[i + 1], bx = (a.x + a.side + b.x) / 2, by = b.y - Math.min(a.side, b.side) * 0.5;
    var topY = Math.min(a.y - a.side - a.dy, b.y - b.side - b.dy) - 34, Rr = Math.min(96, (topY - R.bench.y) / 2 - 4), cx = clamp(bx, 60, R.w - 60), cy;
    if (Rr >= 40) { Rr = Math.min(Rr, R.w * 0.22); cx = clamp(bx, Rr + 12, R.w - Rr - 12); cy = topY - Rr - 4; }
    else {
      var leftFree = rects[0].x - R.bench.x - 20, last = rects[rects.length - 1], rightFree = R.airX - 30 - (last.x + last.side + last.dx) - 20, room = Math.max(leftFree, rightFree);
      Rr = Math.min(90, room / 2 - 6, (R.benchY - R.bench.y) / 2 - 10);
      if (Rr < 30) { Rr = 34; cx = clamp(bx, Rr + 12, R.w - Rr - 12); cy = R.bench.y + Rr; }
      else { cx = leftFree >= rightFree ? rects[0].x - 20 - Rr : last.x + last.side + last.dx + 20 + Rr; cy = Math.max(R.bench.y + Rr + 4, by - Rr * 0.4); }
    }
    // stalk to the boundary
    ctx.strokeStyle = 'rgba(220,240,255,.45)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(cx, cy + Rr); ctx.stroke(); ctx.setLineDash([]);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.fillStyle = 'rgba(4,10,16,.94)'; ctx.fill(); ctx.clip();
    var BL = model.blocks[i], BR = model.blocks[i + 1], sp = 13;
    if (!atoms) { atoms = []; for (var q = 0; q < 400; q++) atoms.push([Math.random() * 7, Math.random() * 7, 7 + Math.random() * 5, 7 + Math.random() * 5]); }
    var ix = 0;
    for (var gx = -Math.ceil(Rr / sp); gx <= Math.ceil(Rr / sp); gx++) {
      var left = gx < 0, B = left ? BL : BR, depth = left ? -gx - 1 : gx, cell = left ? BL.start + Math.max(0, BL.n - 1 - Math.floor(depth / 2)) : BR.start + Math.min(BR.n - 1, Math.floor(depth / 2));
      var T = model.T[cell], water = M[B.mat].stirred, amp = (0.6 + 4.6 * clamp((T + 20) / 120, 0, 1.2)) * (reduced ? 0 : 1);
      for (var gy = -Math.ceil(Rr / sp); gy <= Math.ceil(Rr / sp); gy++) {
        var A = atoms[(ix++) % atoms.length], px = cx + (gx + 0.5) * sp, py = cy + gy * sp;
        if (water) { px += Math.sin(S.t * 0.7 + A[0] * 3) * 4 + Math.sin(S.t * (1 + A[2] * 0.08) + A[1]) * amp * 1.2; py += Math.cos(S.t * 0.6 + A[1] * 3) * 4 + Math.cos(S.t * (1 + A[3] * 0.08) + A[0]) * amp * 1.2; }
        else { px += Math.sin(S.t * A[2] + A[0]) * amp; py += Math.sin(S.t * A[3] + A[1]) * amp; }
        ctx.fillStyle = tcol(T, 0.25); ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
        ctx.fillStyle = tcol(T); ctx.beginPath(); ctx.arc(px, py, 3.4, 0, 7); ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, cy - Rr); ctx.lineTo(cx, cy + Rr); ctx.stroke(); ctx.setLineDash([]);
    // energy hopping across
    if (model.touch && Math.abs(flows[i]) > 1e-3 && !reduced) {
      var dir = flows[i] > 0 ? 1 : -1, nP = clamp(Math.round(2 + Math.log(1 + Math.abs(flows[i])) * 1.6), 2, 9);
      for (var p = 0; p < nP; p++) { var ph = (S.t * 0.6 + p / nP) % 1, ex = cx + dir * (ph - 0.5) * Rr * 1.2, ey = cy + Math.sin(p * 2.3) * Rr * 0.6; ctx.fillStyle = 'rgba(255,212,121,' + (0.9 * Math.sin(ph * Math.PI)) + ')'; ctx.beginPath(); ctx.arc(ex, ey, 2.6, 0, 7); ctx.fill(); }
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(220,240,255,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Rr, 0, 7); ctx.stroke();
    ctx.font = '600 10.5px system-ui,sans-serif'; ctx.fillStyle = C.ink; ctx.textAlign = 'center';
    ctx.fillText('microscope · jiggling exaggerated', cx, cy + Rr + 13);
  }
  // ---------- graph ----------
  function niceT(t) { var steps = [10, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200, 3 * 3600, 6 * 3600, 12 * 3600, 86400, 2 * 86400, 4 * 86400, 8 * 86400]; for (var i = 0; i < steps.length; i++) if (t <= steps[i]) return steps[i]; return t; }
  function tLabel(t) { return t < 60 ? t + ' s' : t < 3600 ? (t / 60) + ' min' : t < 86400 ? (t / 3600) + ' h' : (t / 86400) + ' d'; }
  function panel(r, title) {
    ctx.fillStyle = 'rgba(11,27,39,.82)'; ctx.strokeStyle = C.line; ctx.lineWidth = 1; roundRect(r.x, r.y, r.w, r.h, 10); ctx.fill(); ctx.stroke();
    ctx.font = '700 11px system-ui,sans-serif'; ctx.fillStyle = C.muted; ctx.textAlign = 'left'; ctx.fillText(title, r.x + 10, r.y + 16);
  }
  function drawGraph() {
    var r = R.graph; panel(r, 'TEMPERATURE OVER TIME');
    var x0 = r.x + 34, x1 = r.x + r.w - 10, y0 = r.y + r.h - 20, y1 = r.y + 26;
    var span = niceT(Math.max(10, model.time * 1.02));
    ctx.font = '10px ui-monospace,Menlo,Consolas,monospace'; ctx.textAlign = 'right';
    for (var t = 0; t <= 100; t += 25) { var yy = lerp(y0, y1, t / 100); ctx.strokeStyle = 'rgba(120,170,200,.14)'; ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); ctx.fillStyle = C.muted; ctx.fillText(t + '°', x0 - 4, yy + 3); }
    ctx.textAlign = 'left'; ctx.fillText('0', x0, y0 + 13); ctx.textAlign = 'right'; ctx.fillText(tLabel(span), x1, y0 + 13);
    // the final temperature
    var Tf = model.predictFinal(), yf = lerp(y0, y1, clamp(Tf, 0, 100) / 100);
    ctx.strokeStyle = 'rgba(255,212,121,.75)'; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0, yf); ctx.lineTo(x1, yf); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; ctx.textAlign = 'right'; ctx.fillText('meet at ' + fmt(Tf, 1) + '°', x1 - 2, yf - 4);
    var H = S.hist, n = model.blocks.length;
    function X(tt) { return lerp(x0, x1, tt / span); }
    function Y(T) { return lerp(y0, y1, clamp(T, -2, 102) / 100); }
    for (var b = 0; b < n; b++) {
      ctx.strokeStyle = ID[b]; ctx.lineWidth = 2.2; ctx.beginPath();
      for (var i = 0; i < H.length; i++) { if (H[i].T.length <= b) continue; var px = X(H[i].t), py = Y(H[i].T[b]); if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,135,135,.9)'; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.beginPath();
    for (i = 0; i < H.length; i++) { var qx = X(H[i].t), qy = Y(H[i].p); if (i) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy); }
    ctx.stroke(); ctx.setLineDash([]);
    // legend
    ctx.font = '600 10.5px system-ui,sans-serif'; ctx.textAlign = 'left';
    var thw = ctx.measureText(R.wide ? 'thermometer' : 'therm.').width, lx = r.x + r.w - 10 - (n * 30 + 13 + thw);
    if (lx > r.x + 160) { for (b = 0; b < n; b++) { ctx.fillStyle = ID[b]; ctx.fillRect(lx, r.y + 9, 10, 3); ctx.fillText(NAMES[b], lx + 13, r.y + 16); lx += 30; } ctx.fillStyle = C.red; ctx.fillRect(lx, r.y + 9, 10, 2); ctx.fillText(R.wide ? 'thermometer' : 'therm.', lx + 13, r.y + 16); }
  }
  // ---------- ledger ----------
  function drawLedger() {
    var r = R.led; panel(r, 'ENERGY LEDGER (since the start)');
    var L = model.ledger(), rows = [], n = model.blocks.length, i;
    for (i = 0; i < n; i++) rows.push([NAMES[i] + ' ' + M[model.blocks[i].mat].name.toLowerCase(), L.blocks[i], ID[i]]);
    rows.push(['thermometer', L.probe, C.ink]);
    if (Math.abs(L.air) > 0.05) rows.push(['room air', L.air, C.muted]);
    var maxE = 1; rows.forEach(function (q) { maxE = Math.max(maxE, Math.abs(q[1])); });
    var top = r.y + 24, rowH = Math.min(22, (r.h - 50) / rows.length), labW = R.wide ? Math.min(118, r.w * 0.36) : 108, valW = 74;
    var cx = r.x + labW + (r.w - labW - valW - 8) / 2, half = (r.w - labW - valW - 16) / 2;
    ctx.strokeStyle = 'rgba(220,240,255,.35)'; ctx.beginPath(); ctx.moveTo(cx, top); ctx.lineTo(cx, top + rowH * rows.length); ctx.stroke();
    for (i = 0; i < rows.length; i++) {
      var q = rows[i], y = top + i * rowH, bw = q[1] / maxE * half, hh = Math.max(6, rowH - 8);
      ctx.font = '600 11px system-ui,sans-serif'; ctx.fillStyle = q[2]; ctx.textAlign = 'left'; ctx.fillText(q[0], r.x + 10, y + rowH / 2 + 4);
      ctx.fillStyle = q[1] >= 0 ? 'rgba(255,135,135,.9)' : 'rgba(116,192,252,.9)'; ctx.fillRect(Math.min(cx, cx + bw), y + (rowH - hh) / 2, Math.max(1, Math.abs(bw)), hh);
      ctx.font = '600 11px ui-monospace,Menlo,Consolas,monospace'; ctx.fillStyle = C.ink; ctx.textAlign = 'right'; ctx.fillText((q[1] > 0.0005 ? '+' : '') + fmtE(q[1]), r.x + r.w - 10, y + rowH / 2 + 4);
    }
    var yS = top + rowH * rows.length + 4;
    ctx.strokeStyle = C.line; ctx.beginPath(); ctx.moveTo(r.x + 10, yS); ctx.lineTo(r.x + r.w - 10, yS); ctx.stroke();
    var tot = Math.abs(L.total) < 0.05 ? 0 : L.total;
    ctx.font = '700 11.5px system-ui,sans-serif'; ctx.textAlign = 'left'; ctx.fillStyle = C.green; ctx.fillText('Sum of all changes', r.x + 10, yS + 16);
    ctx.textAlign = 'right'; ctx.font = '700 11.5px ui-monospace,Menlo,Consolas,monospace'; ctx.fillText(fmtE(tot) + ' ✓', r.x + r.w - 10, yS + 16);
    ctx.textAlign = 'left'; ctx.font = '10px system-ui,sans-serif'; ctx.fillStyle = C.muted;
    if (yS + 30 < r.y + r.h) ctx.fillText('red: gained energy · blue: gave it away', r.x + 10, yS + 30);
  }
  function drawBurst(dt) {
    for (var i = burst.length - 1; i >= 0; i--) {
      var p = burst[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 140 * dt; p.life -= dt * 0.8;
      if (p.life <= 0) { burst.splice(i, 1); continue; }
      ctx.globalAlpha = p.life; ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); ctx.globalAlpha = 1;
    }
  }

  // ---------- start ----------
  el.micro.checked = S.micro = !!ui.get('micro', false);
  setSpeed(ui.get('speed', 'auto'));
  layout(); loadPreset(ui.get('pre', 'hot'));
  LAB.loop(frame, view);
  LAB.onTheme(function () { });

  // ======================================================================= the 2-D gas
  (function gas() {
    var gv = $('th1-gas-view'), gcv = $('th1-gas-cv'); if (!gv || !gcv) return;
    var GK = LAB.canvas(gcv), g = GK.c, D = new Z.Disks({ seed: (Date.now() % 9973) + 1 }), paused = false, slow = false, B = 32, hist = new Float64Array(B), vmax = 1500, gclock = 0;
    var wallsBtn = $('th1-gas-walls'), rT = $('th1-g-t'), rK = $('th1-g-k'), rV = $('th1-g-v'), rS = $('th1-g-s'), pb = $('th1-gas-pause');
    function snapshot(wt) { var tmp = new Float64Array(B); for (var i = 0; i < D.N; i++) { var b = Math.floor(D.speed(i) / vmax * B); if (b < B) tmp[b] += 1; } for (var j = 0; j < B; j++) hist[j] = hist[j] * (1 - wt) + tmp[j] / D.N * wt; }
    function same() { D.sameSpeed(Math.max(60, D.temperature())); hist.fill(0); snapshot(1); }
    $('th1-gas-same').addEventListener('click', same);
    wallsBtn.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-w]'); if (!b) return; var v = b.getAttribute('data-w');
      if (v === 'mirror') D.walls = 'mirror'; else { D.walls = 'thermal'; D.Tw = +v; }
      var bs = wallsBtn.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
    });
    $('th1-gas-slow').addEventListener('change', function () { slow = this.checked; });
    function setP(p) { paused = p; pb.textContent = p ? '▶' : '❚❚'; pb.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
    pb.addEventListener('click', function () { setP(!paused); });
    gcv.addEventListener('keydown', function (e) { if (e.key === ' ') { setP(!paused); e.preventDefault(); } });
    snapshot(1);
    function vcol(v, a) { return tcol(clamp(v / 900 * 100, 0, 100), a); }
    LAB.loop(function (dt) {
      if (!paused) { D.step(dt * (slow ? 0.25 : 1)); snapshot(Math.min(1, dt * (slow ? 0.6 : 2))); }
      var w = GK.w, h = GK.h, wide = w >= 560; g.clearRect(0, 0, w, h);
      // the box
      var bx, by, bw, bh, hx, hy, hw, hh;
      if (wide) { bw = Math.min(w * 0.56, (h - 40) * 2); bh = bw / 2; bx = 16; by = (h - bh) / 2; hx = bx + bw + 30; hy = 30; hw = w - hx - 16; hh = h - 70; }
      else { bw = w - 28; bh = bw / 2; bx = 14; by = 50; hx = 44; hy = by + bh + 26; hw = w - hx - 16; hh = h - hy - 34; }
      var s = bw / D.W;
      var wallC = D.walls === 'thermal' ? (D.Tw > 300 ? 'rgba(255,135,135,' : 'rgba(116,192,252,') : 'rgba(220,240,255,';
      g.save(); if (D.walls === 'thermal' && !reduced) { g.shadowColor = wallC + '1)'; g.shadowBlur = 16; }
      g.strokeStyle = wallC + '.85)'; g.lineWidth = D.walls === 'thermal' ? 3 : 1.5; g.strokeRect(bx, by, bw, bh); g.restore();
      for (var i = 0; i < D.N; i++) {
        var v = D.speed(i), px = bx + D.x[i] * s, py = by + D.y[i] * s, rr = Math.max(2, D.r * s);
        g.fillStyle = vcol(v, 0.22); g.beginPath(); g.arc(px, py, rr * 2, 0, 7); g.fill();
        g.fillStyle = vcol(v); g.beginPath(); g.arc(px, py, rr, 0, 7); g.fill();
      }
      g.font = '11px system-ui,sans-serif'; g.fillStyle = C.muted; g.textAlign = 'left';
      g.fillText(D.walls === 'thermal' ? (D.Tw > 300 ? 'hot walls, 600 K' : 'cold walls, 150 K') : 'insulated walls', bx, by - 8);
      // histogram and curve
      var T = D.temperature(), f = function (vv) { return Z.mb2(vv, T); }, peak = f(Math.sqrt(Z.KB * T / Z.M_N2)) * vmax / B;
      var top = 0; for (var j = 0; j < B; j++) top = Math.max(top, hist[j]); top = Math.max(top, peak) * 1.12;
      g.strokeStyle = C.line; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx, hy + hh); g.lineTo(hx + hw, hy + hh); g.stroke();
      var bwid = hw / B;
      for (j = 0; j < B; j++) { var hgt = hist[j] / top * hh; g.fillStyle = vcol((j + 0.5) * vmax / B, 0.85); g.fillRect(hx + j * bwid + 1, hy + hh - hgt, bwid - 2, hgt); }
      g.strokeStyle = C.gold; g.lineWidth = 2.2; g.beginPath();
      for (var k = 0; k <= 120; k++) { var vv = k / 120 * vmax, yy = hy + hh - f(vv) * vmax / B / top * hh, xx = hx + k / 120 * hw; if (k) g.lineTo(xx, yy); else g.moveTo(xx, yy); }
      g.stroke();
      g.fillStyle = C.ink; g.font = '10px ui-monospace,Menlo,Consolas,monospace'; g.textAlign = 'center';
      for (var t = 0; t <= vmax; t += 500) g.fillText(t + '', hx + t / vmax * hw, hy + hh + 13);
      g.textAlign = 'right'; g.fillText('speed, m/s', hx + hw, hy + hh + 26);
      g.textAlign = 'left'; g.font = '600 11px system-ui,sans-serif'; g.fillStyle = C.gold; g.fillText('— Maxwell–Boltzmann curve at ' + Math.round(T) + ' K', hx + 6, hy + 4);
      g.fillStyle = C.muted; g.fillText('bars: molecules in each speed range', hx + 6, hy + 19);
      gclock -= dt; if (gclock <= 0) {
        gclock = 0.25; var sum = 0, sum2 = 0; for (i = 0; i < D.N; i++) { var sv = D.speed(i); sum += sv; sum2 += sv * sv; }
        var mean = sum / D.N, sd = Math.sqrt(Math.max(0, sum2 / D.N - mean * mean));
        rT.textContent = fmt(T, 0) + ' K'; rK.textContent = fmt(Z.KB * T * 1e21, 2) + ' zJ'; rV.textContent = fmt(mean, 0) + ' m/s'; rS.textContent = '± ' + fmt(sd, 0) + ' m/s';
      }
    }, gv);
  })();

  // ======================================================================= temperature scales
  (function scales() {
    var sc = $('th1-sc'), scv = $('th1-sc-cv'); if (!sc || !scv) return;
    var SK = LAB.canvas(scv), g = SK.c, iK = $('th1-sc-k'), iC = $('th1-sc-c'), iF = $('th1-sc-f'), out = $('th1-sc-o'), note = $('th1-sc-note'), marks = $('th1-sc-marks');
    var MARKS = [
      [0, 'Absolute zero', 'Absolute zero: 0 K = −273.15 °C = −459.67 °F. Nothing can be colder.'],
      [4.25, 'Helium boils', 'Liquid helium boils at −268.9 °C, only about 4 K above absolute zero.'],
      [77.35, 'Nitrogen boils', 'Liquid nitrogen boils at −195.8 °C (77 K).'],
      [233.15, '−40°', '−40 °C is exactly −40 °F: the one place the two scales agree.'],
      [273.15, 'Ice melts', 'Water freezes and ice melts at 0 °C = 32 °F = 273.15 K.'],
      [293.15, 'Room', 'A comfortable room: about 20 °C = 68 °F = 293 K.'],
      [310.15, 'Body', 'Normal body temperature: about 37 °C = 98.6 °F = 310 K.'],
      [373.15, 'Water boils', 'Water boils at 100 °C = 212 °F = 373.15 K, at sea-level pressure.']
    ];
    marks.innerHTML = MARKS.map(function (m, i) { return '<button type="button" data-i="' + i + '" aria-pressed="false">' + m[1] + '</button>'; }).join('');
    var Tk = 293.15;
    function set(k, src) {
      Tk = k; var c = k - 273.15, f = c * 9 / 5 + 32;
      if (src !== 'k') iK.value = +k.toFixed(2); if (src !== 'c') iC.value = +c.toFixed(2); if (src !== 'f') iF.value = +f.toFixed(2);
      if (src !== 'slider') sc.value = clamp(k, 0, 400);
      out.textContent = fmt(c, 1) + ' °C';
      var hit = null; MARKS.forEach(function (m) { if (Math.abs(m[0] - k) < 0.3) hit = m; });
      note.textContent = k < 0 ? 'Below 0 K is impossible: absolute zero is the bottom of the scale.' : hit ? hit[2] : '';
      var bs = marks.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', MARKS[i] === hit ? 'true' : 'false');
      drawSc();
    }
    sc.addEventListener('input', function () { set(+sc.value, 'slider'); });
    iK.addEventListener('input', function () { var v = parseFloat(iK.value); if (isFinite(v)) set(v, 'k'); });
    iC.addEventListener('input', function () { var v = parseFloat(iC.value); if (isFinite(v)) set(v + 273.15, 'c'); });
    iF.addEventListener('input', function () { var v = parseFloat(iF.value); if (isFinite(v)) set((v - 32) * 5 / 9 + 273.15, 'f'); });
    marks.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) set(MARKS[+b.getAttribute('data-i')][0]); });
    var dragging = false;
    function fromY(e) { var r = scv.getBoundingClientRect(), y = e.clientY - r.top, y0 = r.height - 24, y1 = 30; set(Math.round(clamp((y0 - y) / (y0 - y1) * 400, 0, 400) * 4) / 4); }
    scv.addEventListener('pointerdown', function (e) { dragging = true; try { scv.setPointerCapture(e.pointerId); } catch (err) { } fromY(e); });
    scv.addEventListener('pointermove', function (e) { if (dragging) fromY(e); });
    scv.addEventListener('pointerup', function () { dragging = false; }); scv.addEventListener('pointercancel', function () { dragging = false; });
    function drawSc() {
      SK.fit(); var w = SK.w, h = SK.h; g.clearRect(0, 0, w, h);
      var y0 = h - 24, y1 = 30, Y = function (k) { return lerp(y0, y1, k / 400); };
      var cols = [['K', w * 0.17, function (k) { return k; }, 50, 0], ['°C', w * 0.43, function (k) { return k - 273.15; }, 50, -250], ['°F', w * 0.69, function (k) { return (k - 273.15) * 1.8 + 32; }, 100, -400]];
      // color band
      var cg = g.createLinearGradient(0, y0, 0, y1); cg.addColorStop(0, '#2b4c7e'); cg.addColorStop(273 / 400, '#74c0fc'); cg.addColorStop(310 / 400, '#ff8787'); cg.addColorStop(1, '#ffd479');
      cols.forEach(function (c) {
        var x = c[1]; g.fillStyle = cg; g.fillRect(x - 3, y1, 6, y0 - y1);
        g.font = '700 13px system-ui,sans-serif'; g.fillStyle = C.ink; g.textAlign = 'center'; g.fillText(c[0], x, 18);
        g.font = '10px ui-monospace,Menlo,Consolas,monospace'; g.textAlign = 'right'; g.fillStyle = C.muted;
        // ticks in the scale's own units
        var lo = c[2](0), hi = c[2](400), step = c[3], t0 = Math.ceil(lo / step) * step;
        for (var t = t0; t <= hi + 1e-9; t += step) { var k = c[0] === 'K' ? t : c[0] === '°C' ? t + 273.15 : (t - 32) / 1.8 + 273.15, y = Y(k); g.strokeStyle = 'rgba(220,240,255,.5)'; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x - 3, y); g.stroke(); g.fillText(String(t).replace('-', '−'), x - 12, y + 3); }
      });
      // landmarks on the right
      g.textAlign = 'left'; g.font = '10.5px system-ui,sans-serif';
      var lastY = 1e9;
      MARKS.slice().sort(function (a, b) { return a[0] - b[0]; }).forEach(function (m) { var y = Y(m[0]); if (Math.abs(lastY - y) < 11) return; lastY = y; g.fillStyle = 'rgba(219,231,239,.55)'; g.fillRect(w * 0.69 + 8, y - 0.5, 8, 1); g.fillText(m[1], w * 0.69 + 19, y + 3.5); });
      // the marker
      var ym = Y(clamp(Tk, 0, 400));
      g.strokeStyle = C.gold; g.lineWidth = 2; g.beginPath(); g.moveTo(8, ym); g.lineTo(w * 0.69 + 6, ym); g.stroke(); g.lineWidth = 1;
      cols.forEach(function (c) { var v = c[2](Tk), txt = fmt(v, Math.abs(v) < 1000 ? 2 : 0); g.font = '700 11px ui-monospace,Menlo,Consolas,monospace'; var tw = g.measureText(txt).width; g.fillStyle = 'rgba(6,17,26,.9)'; g.fillRect(c[1] + 6, ym - 18, tw + 8, 15); g.fillStyle = C.gold; g.textAlign = 'left'; g.fillText(txt, c[1] + 10, ym - 7); });
    }
    window.addEventListener('resize', drawSc);
    set(293.15);
  })();

  // ======================================================================= the touch test
  (function touch() {
    var tcv = $('th1-touch-cv'); if (!tcv) return;
    var TK = LAB.canvas(tcv), g = TK.c, matBox = $('th1-touch-mat'), tIn = $('th1-touch-t'), tOut = $('th1-touch-t-o'), oTc = $('th1-touch-tc'), oQ = $('th1-touch-q');
    var SKIN_T = 33, eS = Z.effusivity(Z.SKIN), mat = 'copper', Tobj = 20, t0 = performance.now();
    matBox.innerHTML = Z.ORDER.map(function (k) { return '<button type="button" data-m="' + k + '" aria-pressed="' + (k === mat) + '">' + M[k].name + '</button>'; }).join('');
    matBox.addEventListener('click', function (e) { var b = e.target.closest('button[data-m]'); if (!b) return; mat = b.getAttribute('data-m'); t0 = performance.now(); var bs = matBox.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false'); upd(); });
    tIn.addEventListener('input', function () { Tobj = +tIn.value; tOut.textContent = Tobj + ' °C'; t0 = performance.now(); upd(); });
    function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
    function upd() {
      var e = Z.effusivity(mat), Tc = Z.contactTemp(SKIN_T, eS, Tobj, e), q = Z.contactFlux(SKIN_T, eS, Tobj, e, 1);
      oTc.textContent = fmt(Tc, 1) + ' °C'; oQ.textContent = fmt(q / 1e4, 2) + ' W' + (q < 0 ? ' (into you)' : '');
    }
    function drawT() {
      var w = TK.w, h = TK.h; g.clearRect(0, 0, w, h);
      var e = Z.effusivity(mat), Tc = Z.contactTemp(SKIN_T, eS, Tobj, e), age = reduced ? 3 : Math.min(3, (performance.now() - t0) / 1000 + 0.05);
      var wide = w >= 420, cw = wide ? w * 0.48 : w, ch = wide ? h : h * 0.56;
      // cross-section: finger above, block below
      var surf = ch * 0.5, fx = cw * 0.5;
      var aS = Z.SKIN.k / (Z.SKIN.rho * Z.SKIN.c), aO = M[mat].k / (M[mat].rho * M[mat].c);
      var dS = 2 * Math.sqrt(aS * age), dO = 2 * Math.sqrt(aO * age), pxS = (surf - 26) / 0.0012, pxO = (ch - surf - 14) / 0.012;
      var fw = Math.min(cw * 0.36, 130), fr = fw * 0.42, ftop = 22, y;
      // the block, colored by temperature with depth
      for (y = surf; y < ch - 4; y += 2) { var z2 = (y - surf) / pxO, T2 = Tc + (Tobj - Tc) * erf(z2 / dO); g.fillStyle = tcol(T2 * 2.2 - 30); g.fillRect(8, y, cw - 16, 2); }
      texture2(mat, 8, surf, cw - 16, ch - surf - 4);
      // the fingertip: a rounded pad pressed flat on the surface, colored by temperature with depth
      g.save(); g.beginPath(); g.moveTo(fx - fw / 2, ftop); g.lineTo(fx - fw / 2, surf - fr * 0.6); g.quadraticCurveTo(fx - fw / 2, surf, fx - fw / 2 + fr, surf); g.lineTo(fx + fw / 2 - fr, surf); g.quadraticCurveTo(fx + fw / 2, surf, fx + fw / 2, surf - fr * 0.6); g.lineTo(fx + fw / 2, ftop); g.closePath(); g.clip();
      for (y = ftop; y < surf; y += 2) { var z = (surf - y) / pxS, T = Tc + (SKIN_T - Tc) * erf(z / dS); g.fillStyle = tcol(T * 2.2 - 30); g.fillRect(fx - fw / 2, y, fw, 2); }
      var sh = g.createLinearGradient(fx - fw / 2, 0, fx + fw / 2, 0); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(0.35, 'rgba(255,255,255,.08)'); sh.addColorStop(1, 'rgba(0,0,0,.32)'); g.fillStyle = sh; g.fillRect(fx - fw / 2, ftop, fw, surf - ftop);
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(fx - fw / 2, ftop); g.lineTo(fx - fw / 2, surf - fr * 0.6); g.quadraticCurveTo(fx - fw / 2, surf, fx - fw / 2 + fr, surf); g.lineTo(fx + fw / 2 - fr, surf); g.quadraticCurveTo(fx + fw / 2, surf, fx + fw / 2, surf - fr * 0.6); g.lineTo(fx + fw / 2, ftop); g.stroke();
      // heat leaving the finger: more arrows for a faster flow
      var qn = Z.contactFlux(SKIN_T, eS, Tobj, e, 1), na = clamp(Math.round(Math.abs(qn) / 1200), 0, 6), dn = qn >= 0 ? 1 : -1;
      for (var a = 0; a < na; a++) {
        var axx = fx - fw * 0.32 + (na > 1 ? a * fw * 0.64 / (na - 1) : fw * 0.32), ph = reduced ? 0.5 : ((performance.now() / 900 + a * 0.29) % 1), ay = surf - 16 * dn + ph * 30 * dn;
        g.globalAlpha = Math.sin(ph * Math.PI); g.strokeStyle = dn > 0 ? C.red : C.blue; g.lineWidth = 2;
        g.beginPath(); g.moveTo(axx, ay - 10 * dn); g.lineTo(axx, ay); g.moveTo(axx - 4, ay - 5 * dn); g.lineTo(axx, ay); g.lineTo(axx + 4, ay - 5 * dn); g.stroke(); g.globalAlpha = 1;
      }
      g.font = '600 11px system-ui,sans-serif'; g.fillStyle = C.ink; g.textAlign = 'left';
      g.fillText('fingertip, 33 °C inside', 12, 16); g.textAlign = 'right'; g.fillStyle = C.muted; g.font = '10px system-ui,sans-serif'; g.fillText('depths not to scale', cw - 12, 16); g.textAlign = 'left'; g.font = '600 11px system-ui,sans-serif'; g.fillStyle = C.ink; g.fillText(M[mat].name + ' at ' + Tobj + ' °C', 12, ch - 8);
      g.strokeStyle = C.gold; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(8, surf); g.lineTo(cw - 8, surf); g.stroke(); g.setLineDash([]);
      g.fillStyle = C.gold; g.textAlign = 'right'; g.font = '700 12px ui-monospace,Menlo,Consolas,monospace'; g.fillText('skin: ' + fmt(Tc, 1) + ' °C', cw - 12, surf - 6);
      // bars: what every material feels like
      var bx = wide ? cw + 14 : 14, by = wide ? 16 : ch + 14, bw = wide ? w - cw - 26 : w - 28, bh = wide ? h - 30 : h - ch - 22;
      g.font = '700 10.5px system-ui,sans-serif'; g.fillStyle = C.muted; g.textAlign = 'left'; g.fillText('SKIN TEMPERATURE WHEN TOUCHING, at ' + Tobj + ' °C', bx, by + 6);
      var rows = Z.ORDER, rh = (bh - 20) / rows.length, lo = Math.min(Tobj, SKIN_T) - 1, hi = Math.max(Tobj, SKIN_T) + 1;
      rows.forEach(function (k, i) {
        var Tk = Z.contactTemp(SKIN_T, eS, Tobj, Z.effusivity(k)), y = by + 16 + i * rh, lab = wide ? 64 : 70, len = (Tk - lo) / (hi - lo) * (bw - lab - 50);
        g.fillStyle = k === mat ? C.ink : C.muted; g.font = (k === mat ? '700 ' : '') + '11px system-ui,sans-serif'; g.textAlign = 'left'; g.fillText(M[k].name, bx, y + rh / 2 + 4);
        g.fillStyle = tcol(Tk * 2.2 - 30, k === mat ? 1 : 0.6); g.fillRect(bx + lab, y + 3, Math.max(2, len), rh - 6);
        g.fillStyle = C.ink; g.font = '11px ui-monospace,Menlo,Consolas,monospace'; g.fillText(fmt(Tk, 1) + '°', bx + lab + Math.max(2, len) + 4, y + rh / 2 + 4);
      });
    }
    function texture2(m, x, y, wd, ht) { var save = ctx; ctx = g; texture(m, x, y, wd, ht); ctx = save; }
    upd();
    LAB.loop(function () { drawT(); }, tcv);
  })();
})();
