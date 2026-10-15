/* Pendulums and Resonance: the page. Draws the three scenes on one canvas, runs the controls and the missions.
   The physics lives in physics.js (window.PendModel), in SI units. */
(function () {
  'use strict';
  var LAB = window.TRBLab, PM = window.PendModel;
  var root = document.getElementById('pendulums-lab');
  if (!root || !LAB || !PM) return;
  function $(id) { return document.getElementById(id); }
  var view = $('pend-view'), cv = $('pend-cv'), K = LAB.canvas(cv), ctx = K.c;
  var fmt = LAB.fmt, reduced = LAB.reduced, D2R = Math.PI / 180, TAU = PM.TAU, GE = PM.GRAV.earth;
  var C = { bg: '#06111a', panel: 'rgba(11,27,39,.92)', ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', faint: 'rgba(120,170,200,.12)', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787', steel: '#4f7a96', post: '#2c4a60' };
  var st = LAB.store('pendulums');
  var SPEEDS = [0.25, 0.5, 1, 2, 4, 8, 16], SPEED_TXT = ['¼×', '½×', '1×', '2×', '4×', '8×', '16×'];
  var H1 = 1 / 600, H3 = 1 / 300;     // fixed physics steps, in seconds of model time
  var MASS = 20;                      // the swing and its rider, kg
  var S = { scene: 'wave', paused: false, speedIx: 2, grav: 'earth', clock: 0, hudClock: 0, acc: 0, drag: null, holding: false };
  function G() { return PM.GRAV[S.grav]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  var STOPS = [C.green, C.blue, C.pink, C.gold].map(hex);
  function mix(u) {
    var x = clamp(u, 0, 1) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i, a = STOPS[i], b = STOPS[i + 1];
    return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)];
  }
  function fmtE(E) { return E < 1 ? fmt(E * 1000, E < 0.01 ? 2 : 1) + ' mJ' : fmt(E, 3) + ' J'; }
  function deg(r) { return r / D2R; }

  // ---------- controls ----------
  var el = {
    scenes: $('pend-scenes'), note: $('pend-note'), hud: $('pend-hud'), pause: $('pend-pause'), speed: $('pend-speed'), reset: $('pend-reset'), push2: $('pend-push2'),
    read: $('pend-read'), readNote: $('pend-read-note'), grav: $('pend-grav'), gravWrap: $('pend-grav-wrap'),
    ctl: { wave: $('pend-c-wave'), pair: $('pend-c-pair'), swing: $('pend-c-swing') },
    wAng: $('pend-w-ang'), wAngO: $('pend-w-ang-o'), wN: $('pend-w-n'), wNO: $('pend-w-n-o'), jump: $('pend-jump'), cam: $('pend-cam'), wFormula: $('pend-w-formula'),
    pLen: $('pend-p-len'), pLenO: $('pend-p-len-o'), pK: $('pend-p-k'), pKO: $('pend-p-k-o'), pMa: $('pend-p-ma'), pMaO: $('pend-p-ma-o'), pMb: $('pend-p-mb'), pMbO: $('pend-p-mb-o'),
    pA: $('pend-p-a'), pAO: $('pend-p-a-o'), pB: $('pend-p-b'), pBO: $('pend-p-b-o'), pStart: $('pend-start'),
    sMotor: $('pend-s-motor'), sF: $('pend-s-f'), sFO: $('pend-s-f-o'), sFm: $('pend-s-fm'), sFp: $('pend-s-fp'), sAmp: $('pend-s-F'), sAmpO: $('pend-s-F-o'),
    sD: $('pend-s-d'), sDO: $('pend-s-d-o'), sL: $('pend-s-L'), sLO: $('pend-s-L-o'), sPush: $('pend-s-push'), sSweep: $('pend-s-sweep'), sClear: $('pend-s-clear'), sTheory: $('pend-s-theory')
  };

  var NOTES = {
    wave: 'Fifteen pendulums, each a little shorter than the last. The longest swings 51 times a minute, the next 52, and so on. Drag the picture to turn it.',
    pair: 'Two pendulums joined by a weak spring. Push one and its swing passes to the other and back. Drag a bob to start it from there.',
    swing: 'A 2 m swing with a 20 kg rider, pushed by a motor or by you. Find the rhythm that makes it climb. Tap the swing to push; tap the graph to pick a rhythm.'
  };
  var LABELS = {
    wave: 'Fifteen pendulums of slowly decreasing length hanging from a bar, drawn at an angle at the top and seen from above at the bottom, with a bar showing progress through the one-minute cycle. Drag the picture or use the arrow keys to turn the view. The time, the pattern and the periods are listed as text in the panel.',
    pair: 'Two pendulums, A and B, joined by a spring. Bars on the right show the energy of each pendulum and of the spring, and a strip at the bottom shows how the energy moves between them over time. Drag a bob to start it from a new angle. The swing times and energies are listed as text in the panel.',
    swing: 'A swing with a teddy bear rider, pushed by a motor with a rhythm you choose. Below it, a graph of the swing size against the push rhythm, with the textbook curve dashed. Tap the swing or press P to push it by hand; tap the graph to choose a rhythm. The numbers are listed as text in the panel.'
  };

  // ---------- missions ----------
  var MISSIONS = [
    { id: 'lineup', title: 'Line up again', goal: 'Watch the pendulum wave until all 15 pendulums swing together again.' },
    { id: 'mass', title: 'Heavy and light', goal: 'Give one bob 4 kg or more and the other 1 kg or less, start them together, and see whether the heavy one swings faster.' },
    { id: 'handoff', title: 'Pass it on', goal: 'Join two equal pendulums with a spring, push only one, and wait until it stops completely while the other swings.' },
    { id: 'tick', title: 'One tick a second', goal: 'Take the spring off and find the length that swings from one side to the other in 1.00 s.' },
    { id: 'slow', title: 'Big swings run slow', goal: 'Start the pendulum wave from 60° or more and find out when the pendulums line up again.' },
    { id: 'push', title: 'Push in time', goal: 'With the motor off, push the swing by hand until it reaches 25°.' },
    { id: 'curve', title: 'Map the peak', goal: 'Let the swing settle at a push rhythm below, near and above its own frequency, so three points of the resonance curve appear.' },
    { id: 'least', title: 'Small push, big swing', goal: 'With the motor\'s push at its weakest, 1 N, get the swing past 10°.' }
  ];
  var TITLE = {}; MISSIONS.forEach(function (m) { TITLE[m.id] = m.title; });
  var PICK = {
    lineup: function () { loadScene('wave'); setWave(12, 51); setSpeed(5); say('Playing at 8×. They line up again after one minute.'); },
    mass: function () { loadScene('pair'); setPair({ L: 100, k: 1, mA: 5, mB: 0.5, a: 20, b: 0 }); setSpeed(2); say('Bob A is 5 kg, bob B 0.5 kg. Now press Together.'); },
    handoff: function () { loadScene('pair'); setPair({ L: 100, k: 1, mA: 1, mB: 1, a: 15, b: 0 }); setSpeed(3); say('Only A was pushed. Watch the energy bars.'); },
    tick: function () { loadScene('pair'); setPair({ L: 60, k: 0, mA: 1, mB: 1, a: 10, b: 0 }); setSpeed(2); say('Change the length until A\'s swing time reads 1.000 s.'); },
    slow: function () { loadScene('wave'); setWave(60, 51); setSpeed(5); say('All start from 60°. Watch the clock: when do they line up?'); },
    push: function () { loadScene('swing'); setSwing({ motor: false, gamma: 0.15, F0: 3, f: 0.25, L: 2 }); setSpeed(2); say('Push each time the swing starts moving away from you, to the right.'); },
    curve: function () { loadScene('swing'); setSwing({ motor: true, gamma: 0.15, F0: 3, f: 0.25, L: 2 }); setSpeed(5); say('Wait for a point to appear on the graph, then try a rhythm near 0.352 Hz, then one above 0.39 Hz.'); },
    least: function () { loadScene('swing'); setSwing({ motor: true, gamma: 0.15, F0: 1, f: 0.25, L: 2 }); setSpeed(5); say('The push is only 1 N. Match the swing\'s own rhythm and turn the damping down.'); }
  };
  var MS = LAB.missions($('pend-missions'), 'pendulums', MISSIONS, function (id) { var p = PICK[id]; if (!p) return; toastQ = []; toastAt = -10; p(); });
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.9) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  function win(id, text) { if (MS.done(id)) say('✓ ' + TITLE[id] + '! ' + text); }

  // ---------- scene 1: the pendulum wave ----------
  var CAMS = { angle: [-36, 17], end: [-82, 12], front: [0, 12] };
  var W = { deg: 12, n0: 51, wave: null, yaw: -36 * D2R, pitch: 17 * D2R, yawT: null, pitchT: null, lastLine: 0, flash: 0, lineT: NaN, cross: NaN, period: NaN, jumping: false, pattern: '', patClock: 0 };
  function buildWave() {
    W.wave = new PM.Wave({ n0: W.n0, cycle: 60, th0: W.deg * D2R, g: G() });
    W.lastLine = 0; W.best = null; W.flash = 0; W.lineT = NaN; W.cross = NaN; W.period = NaN; W.pattern = ''; W.patClock = 0; S.acc = 0;
  }
  function stepWave(h) {
    var w = W.wave, before = w.s[0][0];
    w.step(h);
    var after = w.s[0][0];
    if (before < 0 && after >= 0) { var tc = w.t - h + h * (-before) / (after - before); if (isFinite(W.cross)) W.period = tc - W.cross; W.cross = tc; }
    if (!W.jumping) {   // the line-up: wait for the moment the pendulums are closest together, then report it
      var tR = w.realignTime(), lu = w.lineup();
      if (W.best) { if (lu >= W.best[0]) W.best = [lu, w.t]; else { W.lastLine = W.best[1]; onLineup(W.best[1], tR); W.best = null; } }
      else if (w.t - W.lastLine > 0.5 * tR && lu > 0.995) W.best = [lu, w.t];
    }
  }
  function onLineup(t, tR) {
    W.flash = 1; W.lineT = t;
    var pct = (PM.periodFactor(W.deg * D2R) - 1) * 100;
    var wasDone = MS.isDone('lineup'), t0 = 60 * Math.sqrt(GE / G());
    win('lineup', 'All 15 swing together again at ' + fmt(t, 2) + ' s. The longest made ' + W.n0 + ' swings, the shortest ' + (W.n0 + 14) + '.');
    if (W.deg >= 59.5 && !MS.isDone('slow')) win('slow', 'They lined up at ' + fmt(t, 1) + ' s instead of ' + fmt(t0, 1) + ' s: every swing from ' + W.deg + '° takes ' + fmt(pct, 1) + '% longer than 2π√(L/g) says.');
    else if (wasDone) say('Lined up again at ' + fmt(t, 2) + ' s' + (W.deg >= 20 ? ', ' + fmt(pct, 1) + '% later than ' + fmt(t0, 0) + ' s.' : '.'));
  }
  function jumpWave(j) {
    var w = W.wave, tR = w.realignTime(), target = j === 'almost' ? Math.max(0, tR - 5) : j * tR;
    if (target < w.t) buildWave();
    w = W.wave; W.jumping = true;
    while (w.t + H1 <= target) stepWave(H1);
    W.jumping = false; W.lastLine = j === 'almost' ? 0 : W.lastLine; S.acc = 0;
  }
  function setWave(d, n0) { W.deg = d; W.n0 = n0; el.wAng.value = d; el.wN.value = n0; buildWave(); outputs(); }
  function setCam(name) {
    var c = CAMS[name]; if (!c) return; W.yawT = c[0] * D2R; W.pitchT = c[1] * D2R;
    if (reduced) { W.yaw = W.yawT; W.pitch = W.pitchT; W.yawT = W.pitchT = null; }
    pressSeg(el.cam, 'cam', name);
  }

  // ---------- scene 2: two pendulums joined by a spring ----------
  var P = { L: 1, k: 1, mA: 1, mB: 1, a: 15, b: 0, c: null, hist: [], histClock: 0, flash: [0, 0], meas: null, maxFrac: [0, 0], maxDiff: 0, minRatio: 1, handT: NaN, trail: [[], []], same: false };
  function ratio() { return Math.max(P.mA, P.mB) / Math.min(P.mA, P.mB); }
  function buildPair() {
    P.c = new PM.Coupled({ L: P.L, D: 1.6 * P.L, k: P.k, mA: P.mA, mB: P.mB, g: G(), thA: P.a * D2R, thB: P.b * D2R });
    P.same = Math.abs(P.a - P.b) < 0.5 && Math.abs(P.a) >= 5;
    P.hist = []; P.histClock = 0; P.trail = [[], []]; S.acc = 0;
    resetPairMeas();
  }
  function resetPairMeas() {
    var s = P.c.s;
    function mk(i) { return { lastZ: NaN, halves: [], lastUp: NaN, period: NaN, amp: Math.abs(s[i]) }; }
    P.meas = [mk(0), mk(1)];
    var e = P.c.energies(), tot = e.A + e.B;
    P.maxFrac = tot > 0 ? [e.A / tot, e.B / tot] : [0, 0];
    P.maxDiff = Math.abs(s[0] - s[1]); P.minRatio = ratio(); P.handT = NaN; P.t0 = P.c.t;
  }
  function pairLive() {   // apply the sliders to the running pendulums without restarting them
    var c = P.c; c.L = P.L; c.D = 1.6 * P.L; c.k = P.k; c.mA = P.mA; c.mB = P.mB; c.g = G();
    P.same = P.same && Math.abs(P.c.s[0] - P.c.s[1]) < 0.5 * D2R;
    resetPairMeas();
  }
  function stepPair(h) {
    var c = P.c, s = c.s, pre0 = s[0], pre1 = s[1], w0 = s[2], w1 = s[3];
    c.step(h);
    for (var i = 0; i < 2; i++) {
      var pre = i ? pre1 : pre0, prw = i ? w1 : w0, th = s[i], w = s[2 + i], m = P.meas[i];
      if ((pre < 0 && th >= 0) || (pre > 0 && th <= 0)) {
        var tz = c.t - h + h * pre / (pre - th);
        if (isFinite(m.lastZ)) { m.halves.push(tz - m.lastZ); if (m.halves.length > 4) m.halves.shift(); }
        m.lastZ = tz;
        if (th >= 0) { if (isFinite(m.lastUp)) m.period = tz - m.lastUp; m.lastUp = tz; }
      }
      if ((prw > 0 && w <= 0) || (prw < 0 && w >= 0)) { m.amp = Math.abs(th); if (m.amp > 0.5 * D2R) P.flash[i] = 1; }
    }
    var e = c.energies(), tot = e.A + e.B;
    if (tot > 1e-7) {
      var fA = e.A / tot, fB = e.B / tot;
      if (fA > P.maxFrac[0]) P.maxFrac[0] = fA; if (fB > P.maxFrac[1]) P.maxFrac[1] = fB;
      if (c.k > 0 && !isFinite(P.handT) && ((fA < 0.01 && P.maxFrac[0] > 0.9) || (fB < 0.01 && P.maxFrac[1] > 0.9))) {
        P.handT = c.t;
        var who = fA < 0.01 ? 'A' : 'B', other = who === 'A' ? 'B' : 'A';
        win('handoff', who + ' has stopped and ' + other + ' has all the swing, after ' + fmt(c.t, 1) + ' s. Wait, and it comes back.');
      }
      P.histClock += h;
      if (P.histClock >= 0.05) { P.histClock = 0; P.hist.push(c.t, fA); while (P.hist.length > 2 && P.hist[0] < c.t - 40) P.hist.splice(0, 2); }
    }
    var dd = Math.abs(s[0] - s[1]); if (dd > P.maxDiff) P.maxDiff = dd;
    var r = ratio(); if (r < P.minRatio) P.minRatio = r;
  }
  function pairChecks() {
    var c = P.c, T0 = PM.smallPeriod(c.L, c.g);
    if (P.same && P.minRatio >= 4 && c.t - P.t0 > 3 * T0 && P.maxDiff < 1 * D2R) {
      var heavy = Math.max(P.mA, P.mB), light = Math.min(P.mA, P.mB);
      win('mass', 'The ' + fmt(heavy, 1) + ' kg bob and the ' + fmt(light, 1) + ' kg bob swing exactly together. Mass is not in T = 2π√(L/g).');
    }
    if (c.k === 0) {
      for (var i = 0; i < 2; i++) {
        var m = P.meas[i], hv = m.halves, n = hv.length;
        if (n >= 2 && m.amp >= 2 * D2R && Math.abs(hv[n - 1] - 1) <= 0.005 && Math.abs(hv[n - 2] - 1) <= 0.005) {
          var Ls = PM.lengthFor(2, c.g);
          win('tick', 'At ' + fmt(c.L * 100, 1) + ' cm each swing takes 1.00 s, and a full swing there and back 2 s. The small-swing formula says ' + fmt(Ls * 100, 1) + ' cm.');
          break;
        }
      }
    }
  }
  function setPair(o) {
    if (o.L !== undefined) { P.L = o.L / 100; el.pLen.value = o.L; }
    if (o.k !== undefined) { P.k = o.k; el.pK.value = o.k; }
    if (o.mA !== undefined) { P.mA = o.mA; el.pMa.value = o.mA; }
    if (o.mB !== undefined) { P.mB = o.mB; el.pMb.value = o.mB; }
    if (o.a !== undefined) { P.a = o.a; el.pA.value = o.a; }
    if (o.b !== undefined) { P.b = o.b; el.pB.value = o.b; }
    buildPair(); outputs();
  }

  // ---------- scene 3: the swing ----------
  var SER_COLORS = [C.gold, C.blue, C.pink, C.green, C.red];
  var R = { L: 2, F0: 3, gamma: 0.15, f: 0.25, motor: true, theory: true, d: null, pushes: 0, lastPushT: -1e9, series: [], serN: 0, sweep: null, sweepSer: null, ymax: 10, pushFlash: 0, recFlash: 0, gr: null, highNote: 0 };
  function buildSwing() {
    R.d = new PM.Driven({ L: R.L, g: GE, m: MASS, gamma: R.gamma, F0: R.F0, f: R.f, motor: R.motor });
    R.pushes = 0; R.lastPushT = -1e9; S.acc = 0;
  }
  function swingLive(clearGraph) {
    var d = R.d; d.L = R.L; d.gamma = R.gamma; d.F0 = R.F0; d.f = R.f; d.motor = R.motor; d.changed();
    if (clearGraph) { R.series = []; R.sweep = null; }
  }
  function seriesKey() { return R.gamma.toFixed(2) + '|' + R.F0.toFixed(1) + '|' + R.L.toFixed(2); }
  function getSeries() {
    var key = seriesKey();
    for (var i = 0; i < R.series.length; i++) if (R.series[i].key === key) return R.series[i];
    var s = { key: key, gamma: R.gamma, F0: R.F0, color: SER_COLORS[R.serN++ % SER_COLORS.length], pts: [] };
    R.series.push(s); if (R.series.length > 4) R.series.shift();
    return s;
  }
  function recordPoint() {
    var d = R.d; if (!d.motor) return;
    var a = d.settled(); if (!a) return;
    var ser = getSeries(), p = null;
    for (var i = 0; i < ser.pts.length; i++) if (ser.pts[i].manual && Math.abs(ser.pts[i].f - d.f) < 0.0006) p = ser.pts[i];
    if (p) { p.a = a; p.f = d.f; return; }
    ser.pts.push({ f: d.f, a: a, manual: true }); R.recFlash = 1;
    var f0 = PM.naturalFreq(R.L, GE), lo = false, near = false, hi = false;
    ser.pts.forEach(function (q) { if (!q.manual) return; var r = q.f / f0; if (r < 0.9) lo = true; else if (Math.abs(r - 1) <= 0.03) near = true; else if (r > 1.1) hi = true; });
    if (lo && near && hi) win('curve', 'Below, at and above the swing\'s own frequency: the swing is biggest when the push matches its rhythm.');
    else if (!MS.isDone('curve') && ser.pts.filter(function (q) { return q.manual; }).length === 1) say('Settled at ' + fmt(deg(a), 1) + '°: a point on the curve.');
  }
  function startSweep() {
    var ser = getSeries();
    ser.pts = ser.pts.filter(function (q) { return q.manual; });
    R.sweep = new PM.Sweep({ L: R.L, g: GE, m: MASS, gamma: R.gamma, F0: R.F0 }); R.sweepSer = ser;
  }
  function runSweep() {
    var sw = R.sweep, n0 = sw.points.length;
    sw.run(reduced ? 3000000 : 7000);
    for (var i = n0; i < sw.points.length; i++) R.sweepSer.pts.push({ f: sw.points[i].f, a: sw.points[i].a, manual: false });
    if (sw.done) {
      var best = sw.points.reduce(function (b, p) { return p.a > b.a ? p : b; }, { a: 0, f: 0 });
      say('Curve done: the peak is ' + fmt(deg(best.a), 1) + '° at ' + fmt(best.f, 3) + ' Hz.'); R.sweep = null;
    }
  }
  function doPush() {
    if (S.scene !== 'swing' || !R.d) return;
    var amp = Math.max(R.d.amplitude(), Math.abs(R.d.s[0]));
    if (amp > 60 * D2R) { if (S.clock - R.highNote > 3) { R.highNote = S.clock; say('High enough! No more pushes above 60°.'); } return; }
    R.d.push(); R.pushes++; R.lastPushT = R.d.t; R.pushFlash = 1;
    if (S.paused) setPaused(false);
  }
  function swingChecks() {
    var d = R.d, amp = Math.max(d.amplitude(), Math.abs(d.s[0]));
    if (!d.motor && R.pushes > 0 && amp >= 25 * D2R) win('push', '25° after ' + R.pushes + ' push' + (R.pushes === 1 ? '' : 'es') + '. Each push adds energy only when it goes the same way as the swing.');
    var pk = d.peaks, n = pk.length / 2;
    if (d.motor && R.F0 === 1 && d.t - R.lastPushT > 60 && n >= 2 && pk[2 * n - 1] >= 10 * D2R && pk[2 * n - 1] >= pk[2 * n - 3] * 0.999)
      win('least', 'A 1 N push, the weight of a small apple, holds a 20 kg swing at ' + fmt(deg(pk[2 * n - 1]), 1) + '°, because every push arrives at the right moment.');
  }
  function setSwing(o) {
    ['motor', 'gamma', 'F0', 'f', 'L'].forEach(function (k) { if (o[k] !== undefined) R[k] = o[k]; });
    el.sMotor.checked = R.motor; el.sF.value = R.f; el.sAmp.value = R.F0; el.sD.value = R.gamma; el.sL.value = R.L;
    R.series = []; R.sweep = null; buildSwing(); outputs();
  }

  // ---------- running ----------
  function simulate(dtSim) {
    var h = S.scene === 'swing' ? H3 : H1, steps = 0, max = 2000;
    S.acc += dtSim;
    while (S.acc >= h && steps < max) {
      if (S.scene === 'wave') stepWave(h); else if (S.scene === 'pair') stepPair(h); else R.d.step(h);
      S.acc -= h; steps++;
    }
    if (steps >= max) S.acc = 0;
  }
  function setPaused(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); el.pause.title = p ? 'Play (space)' : 'Pause (space)'; }
  function setSpeed(ix) { S.speedIx = ix; el.speed.textContent = SPEED_TXT[ix]; el.speed.setAttribute('aria-label', 'Playback speed: ' + SPEEDS[ix] + ' times'); st.set('speed', ix); }
  function restart() { if (S.scene === 'wave') buildWave(); else if (S.scene === 'pair') buildPair(); else buildSwing(); }
  function pressSeg(seg, attr, val) { seg.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-' + attr) === val)); }); }

  function loadScene(name) {
    if (!el.ctl[name]) name = 'wave';
    S.scene = name; S.acc = 0; S.drag = null; S.holding = false;
    pressSeg(el.scenes, 'scene', name);
    Object.keys(el.ctl).forEach(function (k) { el.ctl[k].hidden = k !== name; });
    el.gravWrap.hidden = name === 'swing'; el.push2.hidden = name !== 'swing';
    el.note.textContent = NOTES[name]; cv.setAttribute('aria-label', LABELS[name]);
    cv.className = name === 'swing' ? 'pend-tap' : '';
    if (name === 'wave' && !W.wave) buildWave();
    if (name === 'pair' && !P.c) buildPair();
    if (name === 'swing' && !R.d) buildSwing();
    if (name === 'wave' && W.wave.g !== G()) buildWave();
    if (name === 'pair' && P.c.g !== G()) pairLive();
    buildReadouts(); outputs(); st.set('scene', name);
  }

  // ---------- text: outputs, readouts, HUD ----------
  var RD = {
    wave: [['t', 'Time'], ['tr', 'Line up again at'], ['pat', 'Pattern now'], ['l0', 'Longest pendulum'], ['l1', 'Shortest pendulum'], ['ts', 'Longest: small-swing period'], ['te', 'Longest: exact period'], ['tm', 'Longest: measured period'], ['pc', 'Longer than small-swing by']],
    pair: [['ha', 'A: swing time'], ['pa', 'A: period'], ['hb', 'B: swing time'], ['pb', 'B: period'], ['ts', 'Small-swing period 2π√(L/g)'], ['ea', 'Energy of A'], ['eb', 'Energy of B'], ['es', 'Energy in the spring'], ['et', 'Total energy'], ['ho', 'Hand-off time (theory)']],
    swing: [['amp', 'Swing size now'], ['f0', 'Swing\'s own frequency'], ['T0', 'Its own period'], ['f', 'Push rhythm'], ['Tf', 'One push every'], ['r', 'Rhythm ÷ own frequency'], ['lag', 'Swing lags the push by'], ['th', 'Textbook steady size'], ['e', 'Energy of the swing'], ['n', 'Pushes by hand']]
  };
  var READ_NOTES = {
    wave: 'Periods are for the longest pendulum. The exact period comes from the elliptic-integral formula; the measured one is timed in the simulation between two passes through the middle.',
    pair: 'Swing time is one side to the other: half a period, timed in the simulation between passes through the middle. Energy counts each pendulum\'s motion and height; with no friction the total stays the same.',
    swing: 'Swing size is the angle at the highest point of the last swing. The textbook size is the small-swing formula for a settled swing at this rhythm.'
  };
  var rd = {};
  function buildReadouts() {
    var list = RD[S.scene];
    el.read.innerHTML = list.map(function (r) { return '<dt>' + r[1] + '</dt><dd id="pend-r-' + r[0] + '">—</dd>'; }).join('');
    rd = {}; list.forEach(function (r) { rd[r[0]] = $('pend-r-' + r[0]); });
    el.readNote.textContent = READ_NOTES[S.scene];
  }
  function set(id, v) { if (rd[id] && rd[id].textContent !== v) rd[id].textContent = v; }
  function outputs() {
    el.wAngO.textContent = W.deg + '°'; el.wNO.textContent = W.n0 + ' to ' + (W.n0 + 14);
    el.pLenO.textContent = fmt(P.L * 100, 1) + ' cm'; el.pKO.textContent = P.k === 0 ? 'off' : fmt(P.k, 2) + ' N/m';
    el.pMaO.textContent = fmt(P.mA, 1) + ' kg'; el.pMbO.textContent = fmt(P.mB, 1) + ' kg';
    el.pAO.textContent = fmt(P.a, 0) + '°'; el.pBO.textContent = fmt(P.b, 0) + '°';
    el.sFO.textContent = fmt(R.f, 3) + ' Hz'; el.sAmpO.textContent = fmt(R.F0, 1) + ' N';
    el.sDO.textContent = fmt(R.gamma, 2) + ' /s · halves in ' + fmt(2 * Math.LN2 / R.gamma, 1) + ' s'; el.sLO.textContent = fmt(R.L, 2) + ' m · own ' + fmt(PM.naturalFreq(R.L, GE), 3) + ' Hz';
    pressSeg(el.grav, 'g', S.grav);
  }
  var PAT = { 2: 'two rows, swinging against each other', 3: 'three groups', 4: 'four groups', 5: 'five groups', 6: 'six groups' };
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function wavePattern() {
    var w = W.wave, tR = w.realignTime(), fr = (w.t / tR) % 1;
    if (w.t > 1 && (fr < 0.004 || fr > 0.996)) return 'all together';
    for (var q = 2; q <= 6; q++) for (var p = 1; p < q; p++) if (gcd(p, q) === 1 && Math.abs(fr - p / q) < 0.004) return PAT[q];
    return '';
  }
  function updateText() {
    var h = '';
    if (S.scene === 'wave') {
      var w = W.wave, tR = w.realignTime(), Ts = PM.smallPeriod(w.L[0], w.g), Te = Ts * PM.periodFactor(w.th0);
      set('t', fmt(w.t, 1) + ' s'); set('tr', fmt(tR, 2) + ' s'); set('pat', W.pattern || 'waves and snakes');
      set('l0', fmt(w.L[0] * 100, 2) + ' cm, ' + W.n0 + ' swings'); set('l1', fmt(w.L[w.count - 1] * 100, 2) + ' cm, ' + (W.n0 + 14) + ' swings');
      set('ts', fmt(Ts, 4) + ' s'); set('te', fmt(Te, 4) + ' s'); set('tm', isFinite(W.period) ? fmt(W.period, 4) + ' s' : 'timing…');
      set('pc', fmt((Te / Ts - 1) * 100, 2) + '%');
      h = '<b>t = ' + fmt(w.t, 1) + ' s</b> <span class="pend-dim">of ' + fmt(tR, 2) + ' s</span><br>' + (W.pattern ? 'now: ' + W.pattern : '<span class="pend-dim">start ' + W.deg + '° · ' + (S.grav === 'earth' ? 'Earth' : S.grav === 'moon' ? 'Moon' : 'Mars') + '</span>');
    } else if (S.scene === 'pair') {
      var c = P.c, e = c.energies(), md = c.modes(), m0 = P.meas[0], m1 = P.meas[1];
      var lastHalf = function (m) { return m.halves.length && m.amp > 0.5 * D2R ? fmt(m.halves[m.halves.length - 1], 3) + ' s' : '—'; };
      set('ha', lastHalf(m0)); set('pa', isFinite(m0.period) && m0.amp > 0.5 * D2R ? fmt(m0.period, 3) + ' s' : '—');
      set('hb', lastHalf(m1)); set('pb', isFinite(m1.period) && m1.amp > 0.5 * D2R ? fmt(m1.period, 3) + ' s' : '—');
      set('ts', fmt(PM.smallPeriod(c.L, c.g), 3) + ' s');
      set('ea', fmtE(e.A)); set('eb', fmtE(e.B)); set('es', fmtE(e.spring)); set('et', fmtE(e.total));
      set('ho', c.k > 0 ? fmt(md.handoff, 1) + ' s' : 'no spring');
      h = 'A <b>' + fmt(deg(c.s[0]), 1) + '°</b> &nbsp;B <b>' + fmt(deg(c.s[1]), 1) + '°</b><br><span class="pend-dim">t = ' + fmt(c.t, 1) + ' s · L = ' + fmt(c.L * 100, 1) + ' cm</span>';
    } else {
      var d = R.d, f0 = PM.naturalFreq(R.L, GE), amp = d.amplitude(), lag = d.lag();
      set('amp', fmt(deg(amp), 1) + '°'); set('f0', fmt(f0, 3) + ' Hz'); set('T0', fmt(1 / f0, 2) + ' s'); set('f', fmt(R.f, 3) + ' Hz'); set('Tf', fmt(1 / R.f, 2) + ' s');
      set('r', fmt(R.f / f0, 3)); set('lag', !d.motor ? '—' : d.settled() && isFinite(lag) ? fmt(deg(lag), 0) + '°' : 'settling…');
      set('th', d.motor ? fmt(deg(PM.ampTheory({ g: GE, L: R.L, m: MASS, gamma: R.gamma, F0: R.F0 }, R.f)), 1) + '°' : 'motor off');
      set('e', fmtE(d.energy())); set('n', String(R.pushes));
      h = 'swing <b>' + fmt(deg(amp), 1) + '°</b> &nbsp;' + (d.motor ? 'push ' + fmt(R.f, 3) + ' Hz' : 'motor off') + '<br><span class="pend-dim">own frequency ' + fmt(f0, 3) + ' Hz</span>';
    }
    if (el.hud.innerHTML !== h) el.hud.innerHTML = h;
  }

  // ---------- drawing helpers ----------
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function ball(x, y, r, c) {
    var gl = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 2.6); gl.addColorStop(0, rgba(c, 0.28)); gl.addColorStop(1, rgba(c, 0)); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, TAU); ctx.fill();
    var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, rgba(c, 1)); g.addColorStop(1, rgba([Math.round(c[0] * 0.45), Math.round(c[1] * 0.45), Math.round(c[2] * 0.45)], 1));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function text(t, x, y, col, size, align, weight) { ctx.fillStyle = col; ctx.font = (weight || 600) + ' ' + (size || 11) + 'px system-ui,-apple-system,Segoe UI,sans-serif'; ctx.textAlign = align || 'left'; ctx.fillText(t, x, y); }
  function smooth(pts) {   // a smooth curve through points [x0,y0,x1,y1,…]
    var n = pts.length / 2; if (n < 2) return;
    ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (var i = 1; i < n - 1; i++) { var mx = (pts[2 * i] + pts[2 * i + 2]) / 2, my = (pts[2 * i + 1] + pts[2 * i + 3]) / 2; ctx.quadraticCurveTo(pts[2 * i], pts[2 * i + 1], mx, my); }
    ctx.lineTo(pts[2 * n - 2], pts[2 * n - 1]);
  }
  function arrow(x1, y1, x2, y2, col, wd) {
    var a = Math.atan2(y2 - y1, x2 - x1), hl = Math.min(12, 4 + wd * 2.5);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - hl * 0.6 * Math.cos(a), y2 - hl * 0.6 * Math.sin(a)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - hl * Math.cos(a - 0.45), y2 - hl * Math.sin(a - 0.45)); ctx.lineTo(x2 - hl * Math.cos(a + 0.45), y2 - hl * Math.sin(a + 0.45)); ctx.closePath(); ctx.fill();
  }
  function backdrop() {
    var w = K.w, h = K.h;
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    var g = ctx.createRadialGradient(w * 0.5, h * 0.3, 10, w * 0.5, h * 0.3, Math.max(w, h) * 0.8);
    g.addColorStop(0, 'rgba(40,90,120,.18)'); g.addColorStop(1, 'rgba(6,17,26,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  // ---------- drawing: the pendulum wave ----------
  var proj = { x: 0, y: 0, k: 0, z: 0 };
  function drawWave(dt) {
    var w = K.w, h = K.h, wave = W.wave, n = wave.count, Lmax = wave.L[0], narrow = w < 560;
    if (W.yawT !== null) { W.yaw += (W.yawT - W.yaw) * Math.min(1, dt * 5); W.pitch += (W.pitchT - W.pitch) * Math.min(1, dt * 5); if (Math.abs(W.yawT - W.yaw) < 0.002 && Math.abs(W.pitchT - W.pitch) < 0.002) { W.yaw = W.yawT; W.pitch = W.pitchT; W.yawT = W.pitchT = null; } }
    var split = Math.round(h * (narrow ? 0.58 : 0.64));
    var B = 2.2 * Lmax, Hb = 1.22 * Lmax, cyw = Math.cos(W.yaw), syw = Math.sin(W.yaw), cp = Math.cos(W.pitch), sp = Math.sin(W.pitch);
    var Tz = Hb * 0.55, Rc = 4.2 * Lmax, Cx = Rc * syw * cp, Cy = -Rc * cyw * cp, Cz = Tz + Rc * sp;
    var fx = -syw * cp, fy = cyw * cp, fz = -sp, rx = cyw, ry = syw, ux = -syw * sp, uy = cyw * sp, uz = cp;
    var F = Math.min(0.84 * w * Rc / B, 0.64 * split * Rc / (1.38 * Lmax)), ox = w / 2, oy = split * 0.5 + 6;
    function P3(X, Y, Z) { var vx = X - Cx, vy = Y - Cy, vz = Z - Cz, zc = vx * fx + vy * fy + vz * fz; if (zc < 0.2 * Lmax) zc = 0.2 * Lmax; var k = F / zc; proj.x = ox + k * (vx * rx + vy * ry); proj.y = oy - k * (vx * ux + vy * uy + vz * uz); proj.k = k; proj.z = zc; return proj; }
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, split); ctx.clip();
    // floor grid
    ctx.lineWidth = 1; ctx.strokeStyle = C.faint;
    var gx = 0.7 * B, gy = 0.9 * Lmax, i, a;
    for (i = -6; i <= 6; i++) { var X = gx * i / 6; P3(X, -gy, 0); a = [proj.x, proj.y]; P3(X, gy, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(proj.x, proj.y); ctx.stroke(); }
    for (i = -4; i <= 4; i++) { var Y = gy * i / 4; P3(-gx, Y, 0); a = [proj.x, proj.y]; P3(gx, Y, 0); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(proj.x, proj.y); ctx.stroke(); }
    // frame
    var px = B / 2 + 0.14 * Lmax;
    function seg3(x1, y1, z1, x2, y2, z2, col, wd) { P3(x1, y1, z1); var ax = proj.x, ay = proj.y, k1 = proj.k; P3(x2, y2, z2); ctx.strokeStyle = col; ctx.lineWidth = Math.max(1.5, wd * (k1 + proj.k) / 2); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(proj.x, proj.y); ctx.stroke(); }
    [-px, px].forEach(function (X) { seg3(X, -0.4 * Lmax, 0, X, 0.4 * Lmax, 0, C.post, 0.035 * Lmax); seg3(X, 0, 0, X, 0, Hb + 0.03 * Lmax, C.post, 0.035 * Lmax); });
    seg3(-px, 0, Hb, px, 0, Hb, C.steel, 0.03 * Lmax);
    // bobs and their shadows
    var items = [], th0 = W.wave.th0;
    for (i = 0; i < n; i++) {
      var Xk = -B / 2 + B * i / (n - 1), L = wave.L[i], th = wave.s[i][0], Yb = L * Math.sin(th), Zb = Hb - L * Math.cos(th);
      P3(Xk, 0, Hb); var pvx = proj.x, pvy = proj.y;
      P3(Xk, Yb, 0); var shx = proj.x, shy = proj.y, shk = proj.k;
      P3(Xk, Yb, Zb);
      items.push({ i: i, px: pvx, py: pvy, x: proj.x, y: proj.y, k: proj.k, z: proj.z, sx: shx, sy: shy, sk: shk, c: mix(i / (n - 1)) });
    }
    items.forEach(function (it) { var r = 0.07 * Lmax * it.sk; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(it.sx, it.sy, r, Math.max(1, r * Math.max(0.15, sp)), 0, 0, TAU); ctx.fill(); ctx.fillStyle = rgba(it.c, 0.10); ctx.beginPath(); ctx.ellipse(it.sx, it.sy, r * 1.8, Math.max(1, r * 1.8 * Math.max(0.15, sp)), 0, 0, TAU); ctx.fill(); });
    // the wave through the bobs
    var pts = []; items.forEach(function (it) { pts.push(it.x, it.y); });
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    smooth(pts); ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 7; ctx.stroke();
    smooth(pts); ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 1.4; ctx.stroke();
    items.slice().sort(function (p, q) { return q.z - p.z; }).forEach(function (it) {
      ctx.strokeStyle = 'rgba(214,230,240,.55)'; ctx.lineWidth = Math.max(0.8, 0.008 * Lmax * it.k); ctx.beginPath(); ctx.moveTo(it.px, it.py); ctx.lineTo(it.x, it.y); ctx.stroke();
      ctx.fillStyle = '#9fb6c6'; ctx.beginPath(); ctx.arc(it.px, it.py, Math.max(1.5, 0.016 * Lmax * it.k), 0, TAU); ctx.fill();
      ball(it.x, it.y, Math.max(3, 0.052 * Lmax * it.k), it.c);
    });
    if (W.flash > 0) {
      var al = W.flash;
      text('Lined up again at ' + fmt(W.lineT, 2) + ' s', w / 2, split - (narrow ? 34 : 40), 'rgba(255,212,121,' + al + ')', narrow ? 15 : 18, 'center', 700);
    }
    text(narrow ? 'Drag to turn' : 'Drag to turn the view', w - 12, split - 12, C.muted, 11, 'right', 500);
    ctx.restore();
    // top view
    var pad = 10, y0 = split + 2, ph = h - split - pad - 2;
    rr(pad, y0, w - 2 * pad, ph, 12); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    text('TOP VIEW', pad + 12, y0 + 19, C.muted, 10.5, 'left', 700);
    // cycle bar
    var tR = wave.realignTime(), bx0 = pad + (narrow ? 82 : 96), bx1 = w - pad - (narrow ? 86 : 118), by = y0 + 15;
    ctx.fillStyle = 'rgba(120,170,200,.16)'; rr(bx0, by - 3, bx1 - bx0, 6, 3); ctx.fill();
    ctx.fillStyle = C.green; rr(bx0, by - 3, Math.max(6, (bx1 - bx0) * ((wave.t / tR) % 1 || (wave.t > 0 ? 1 : 0))), 6, 3); ctx.fill();
    [[0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']].forEach(function (q) { var x = bx0 + (bx1 - bx0) * q[0]; ctx.fillStyle = 'rgba(219,231,239,.6)'; ctx.fillRect(x - 0.5, by - 6, 1, 12); if (!narrow || q[0] === 0.5 || q[0] === 0.25 || q[0] === 0.75) text(q[1], x, by + 17, C.muted, 10, 'center', 600); });
    text(fmt(wave.t, 1) + ' / ' + fmt(tR, 1) + ' s', w - pad - 12, y0 + 19, C.ink, 11, 'right', 600);
    var ix = pad + 14, iw = w - 2 * pad - 28, iy = y0 + 34, ih = ph - 42;
    var s = Math.min(iw / (B + 0.2 * Lmax), (ih / 2) / (Lmax * Math.sin(Math.max(W.deg, 8) * D2R) * 1.06 + 0.06 * Lmax)), cx = ix + iw / 2, cy = iy + ih / 2;
    ctx.strokeStyle = 'rgba(159,182,198,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - (B / 2 + 0.08 * Lmax) * s, cy); ctx.lineTo(cx + (B / 2 + 0.08 * Lmax) * s, cy); ctx.stroke();
    var tp = [];
    for (i = 0; i < n; i++) {
      var xx = cx + (-B / 2 + B * i / (n - 1)) * s, ext = wave.L[i] * Math.sin(th0) * s, col = mix(i / (n - 1));
      ctx.strokeStyle = rgba(col, 0.18); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xx, cy - ext); ctx.lineTo(xx, cy + ext); ctx.stroke();
      tp.push(xx, cy - wave.L[i] * Math.sin(wave.s[i][0]) * s);
    }
    smooth(tp); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 8; ctx.stroke();
    smooth(tp); ctx.strokeStyle = 'rgba(255,255,255,.30)'; ctx.lineWidth = 1.5; ctx.stroke();
    var br = clamp(0.05 * Lmax * s, 3.5, 8);
    for (i = 0; i < n; i++) ball(tp[2 * i], tp[2 * i + 1], br, mix(i / (n - 1)));
    if (W.flash > 0) { ctx.strokeStyle = 'rgba(255,212,121,' + 0.6 * W.flash + ')'; ctx.lineWidth = 3; rr(pad, y0, w - 2 * pad, ph, 12); ctx.stroke(); W.flash = Math.max(0, W.flash - dt / 2.2); }
  }

  // ---------- drawing: two pendulums ----------
  function zigzag(x1, y1, x2, y2, coils, amp) {
    var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, lead = Math.min(10, l * 0.12);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + ux * lead, y1 + uy * lead);
    var body = l - 2 * lead;
    for (var i = 1; i <= coils * 2; i++) { var t = lead + body * (i - 0.5) / (coils * 2), sgn = i % 2 ? 1 : -1; ctx.lineTo(x1 + ux * t + nx * amp * sgn, y1 + uy * t + ny * amp * sgn); }
    ctx.lineTo(x2 - ux * lead, y2 - uy * lead); ctx.lineTo(x2, y2);
  }
  var pairGeo = null;
  function drawPair(dt) {
    var w = K.w, h = K.h, c = P.c, narrow = w < 560;
    var chartH = Math.max(100, Math.round(h * 0.25)), barsW = narrow ? 0 : Math.min(150, Math.round(w * 0.2)), rowH = narrow ? 74 : 0;
    var aw = w - barsW, ah = h - chartH - rowH, L = c.L;
    var s = Math.min((aw - 20) / (3.15 * L), (ah - 92) / (1.1 * L)), cx = aw / 2 + 6, py = Math.max(66, Math.round((ah - 1.12 * L * s) / 2));
    var xA = cx - c.D / 2 * s, xB = cx + c.D / 2 * s;
    // ceiling and beam
    ctx.strokeStyle = 'rgba(120,170,200,.22)'; ctx.lineWidth = 1;
    for (var x = xA - 0.4 * L * s; x < xB + 0.4 * L * s; x += 9) { ctx.beginPath(); ctx.moveTo(x, py - 4); ctx.lineTo(x + 6, py - 11); ctx.stroke(); }
    ctx.strokeStyle = C.steel; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(xA - 0.4 * L * s, py - 2); ctx.lineTo(xB + 0.4 * L * s, py - 2); ctx.stroke();
    ctx.setLineDash([4, 6]); ctx.strokeStyle = 'rgba(143,179,198,.28)'; ctx.lineWidth = 1;
    [xA, xB].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + L * s + 24); ctx.stroke(); });
    ctx.setLineDash([]);
    var cols = [hex(C.green), hex(C.pink)], ms = [c.mA, c.mB], base = Math.max(7, 0.06 * L * s), bob = [];
    for (var i = 0; i < 2; i++) {
      var th = c.s[i], pvx = i ? xB : xA;
      bob.push({ x: pvx + L * s * Math.sin(th), y: py + L * s * Math.cos(th), r: clamp(base * Math.cbrt(ms[i]), 5, 2.1 * base), px: pvx });
      var tr = P.trail[i]; tr.push(th); if (tr.length > (reduced ? 1 : 26)) tr.shift();
    }
    // trails
    if (!reduced) for (i = 0; i < 2; i++) {
      var tr2 = P.trail[i]; if (tr2.length < 2) continue;
      for (var j = 1; j < tr2.length; j++) {
        ctx.strokeStyle = rgba(cols[i], 0.25 * j / tr2.length); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bob[i].px + L * s * Math.sin(tr2[j - 1]), py + L * s * Math.cos(tr2[j - 1])); ctx.lineTo(bob[i].px + L * s * Math.sin(tr2[j]), py + L * s * Math.cos(tr2[j])); ctx.stroke();
      }
    }
    // spring
    if (c.k > 0) {
      var stretch = c.springStretch(), tens = clamp(Math.abs(stretch) / (0.25 * L), 0, 1);
      var ddx = bob[1].x - bob[0].x, ddy = bob[1].y - bob[0].y, dl = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
      var sx1 = bob[0].x + ddx / dl * bob[0].r, sy1 = bob[0].y + ddy / dl * bob[0].r, sx2 = bob[1].x - ddx / dl * bob[1].r, sy2 = bob[1].y - ddy / dl * bob[1].r;
      zigzag(sx1, sy1, sx2, sy2, 14, clamp(3 + c.k * 1.2, 3, 8));
      ctx.strokeStyle = 'rgba(255,212,121,' + (0.55 + 0.45 * tens) + ')'; ctx.lineWidth = 1.6; ctx.lineJoin = 'round'; ctx.stroke();
    } else text('no spring', cx, py + L * s * 0.98 + 4, 'rgba(143,179,198,.6)', 11, 'center', 500);
    for (i = 0; i < 2; i++) {
      var bb = bob[i];
      ctx.strokeStyle = '#b8c7d3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bb.px, py); ctx.lineTo(bb.x, bb.y); ctx.stroke();
      ctx.fillStyle = '#9fb6c6'; ctx.beginPath(); ctx.arc(bb.px, py, 3.5, 0, TAU); ctx.fill();
      if (P.flash[i] > 0) { var fl = P.flash[i]; ctx.strokeStyle = rgba(cols[i], 0.7 * fl); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bb.x, bb.y, bb.r + 4 + (1 - fl) * 16, 0, TAU); ctx.stroke(); P.flash[i] = Math.max(0, fl - dt / 0.45); }
      ball(bb.x, bb.y, bb.r, cols[i]);
      text(i ? 'B' : 'A', bb.px, py - 16, i ? C.pink : C.green, 13, 'center', 800);
      text(fmt(ms[i], 1) + ' kg', bb.x, bb.y + bb.r + 15, 'rgba(219,231,239,.75)', 10.5, 'center', 600);
    }
    pairGeo = { py: py, s: s, L: L, bob: bob };
    // energy bars
    var e = c.energies(), tot = Math.max(e.total, 1e-9), bx0 = aw + 6, bw = barsW - 18, top = 78, bot = ah - 30, bh = bot - top;
    var bars = [[e.A, C.green, 'A'], [e.B, C.pink, 'B'], [e.spring, C.gold, 'spring']], cw = bw / 3;
    if (narrow) {   // a row of sideways bars under the pendulums
      var rx0 = 58, rw = w - rx0 - 52, ry = ah + 4;
      text('ENERGY', 14, ry + 10, C.muted, 10, 'left', 700);
      bars.forEach(function (bq, k) {
        var yy = ry + 18 + k * 17, ww = rw * clamp(bq[0] / tot, 0, 1);
        text(bq[2], rx0 - 6, yy + 9, bq[1], 10.5, 'right', 700);
        ctx.fillStyle = 'rgba(120,170,200,.10)'; rr(rx0, yy, rw, 11, 4); ctx.fill();
        if (ww > 0.5) { ctx.fillStyle = bq[1]; rr(rx0, yy, ww, 11, Math.min(4, ww / 2)); ctx.fill(); }
        text(Math.round(100 * bq[0] / tot) + '%', w - 14, yy + 9, C.ink, 10, 'right', 600);
      });
    } else text('ENERGY', bx0 + bw / 2, top - 12, C.muted, 10.5, 'center', 700);
    if (!narrow) bars.forEach(function (bq, k) {
      var x0 = bx0 + k * cw + cw * 0.18, ww = cw * 0.64, hh = bh * clamp(bq[0] / tot, 0, 1);
      ctx.fillStyle = 'rgba(120,170,200,.10)'; rr(x0, top, ww, bh, 4); ctx.fill();
      if (hh > 0.5) { var g = ctx.createLinearGradient(0, bot - hh, 0, bot); g.addColorStop(0, bq[1]); g.addColorStop(1, rgba(hex(bq[1]), 0.45)); ctx.fillStyle = g; rr(x0, bot - hh, ww, hh, Math.min(4, hh / 2)); ctx.fill(); }
      text(bq[2], x0 + ww / 2, bot + 15, bq[1], 11, 'center', 700);
      text(Math.round(100 * bq[0] / tot) + '%', x0 + ww / 2, Math.min(bot - hh - 5, bot - 5), C.ink, 10, 'center', 600);
    });
    // strip chart of the energy share
    var gx0 = 12, gy0 = ah + rowH + 4, gw = w - 24, gh = chartH - 14;
    rr(gx0, gy0, gw, gh, 10); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    text(narrow ? 'Share of the energy, last 40 s' : 'Share of the energy over the last 40 s: A (green) and B (pink)', gx0 + 10, gy0 + 15, C.muted, 10.5, 'left', 600);
    var lx = gx0 + 10, lw = gw - 20, ly = gy0 + 22, lh = gh - 30, hist = P.hist, now = c.t;
    ctx.strokeStyle = 'rgba(120,170,200,.15)'; ctx.beginPath(); ctx.moveTo(lx + 30, ly + lh / 2); ctx.lineTo(lx + lw, ly + lh / 2); ctx.moveTo(lx + 30, ly); ctx.lineTo(lx + lw, ly); ctx.moveTo(lx + 30, ly + lh); ctx.lineTo(lx + lw, ly + lh); ctx.stroke();
    text('100%', lx + 24, ly + 4, C.muted, 9.5, 'right', 500); text('50%', lx + 24, ly + lh / 2 + 3, C.muted, 9.5, 'right', 500); text('0', lx + 24, ly + lh + 3, C.muted, 9.5, 'right', 500);
    lx += 30; lw -= 30;
    if (hist.length >= 4) {
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (var q = 0; q < hist.length; q += 2) { var xq = lx + lw * (1 - (now - hist[q]) / 40), v = pass ? 1 - hist[q + 1] : hist[q + 1], yq = ly + lh * (1 - v); if (q === 0) ctx.moveTo(xq, yq); else ctx.lineTo(xq, yq); }
        ctx.strokeStyle = pass ? C.pink : C.green; ctx.lineWidth = 2; ctx.stroke();
      }
    }
  }

  // ---------- drawing: the swing and its resonance curve ----------
  function drawSwing(dt) {
    var w = K.w, h = K.h, d = R.d, narrow = w < 560, hs = Math.round(h * 0.56), ground = hs - 14;
    var s = Math.min((hs - 50) / 3.6, (w - 40) / 5.4), px = w / 2 + (narrow ? 14 : 0), py = ground - (R.L + 0.55) * s;
    // ground
    var gg = ctx.createLinearGradient(0, ground, 0, hs + 4); gg.addColorStop(0, 'rgba(99,230,190,.16)'); gg.addColorStop(1, 'rgba(99,230,190,0)');
    ctx.fillStyle = gg; ctx.fillRect(0, ground, w, hs - ground + 4);
    ctx.strokeStyle = 'rgba(99,230,190,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(w, ground); ctx.stroke();
    // frame
    var spread = (R.L + 0.55) * s * 0.42;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f3647'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px + 5, py - 2); ctx.lineTo(px - spread + 10, ground); ctx.moveTo(px + 5, py - 2); ctx.lineTo(px + spread + 10, ground); ctx.stroke();
    ctx.strokeStyle = C.post; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - spread, ground); ctx.moveTo(px, py); ctx.lineTo(px + spread, ground); ctx.stroke();
    // swing range
    var amp = d.amplitude(), th = d.s[0], Ls = R.L * s;
    if (amp > 0.3 * D2R) {
      var ra = Ls + 22, am = Math.min(amp, Math.PI);
      ctx.strokeStyle = 'rgba(255,212,121,.30)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, ra, Math.PI / 2 - am, Math.PI / 2 + am); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,212,121,.6)'; ctx.lineWidth = 2; ctx.beginPath();
      [-am, am].forEach(function (q) { ctx.moveTo(px + (ra - 5) * Math.sin(q), py + (ra - 5) * Math.cos(q)); ctx.lineTo(px + (ra + 5) * Math.sin(q), py + (ra + 5) * Math.cos(q)); });
      ctx.stroke();
    }
    ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(143,179,198,.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, ground); ctx.stroke(); ctx.setLineDash([]);
    var sx = px + Ls * Math.sin(th), sy = py + Ls * Math.cos(th), tx = Math.cos(th), ty = -Math.sin(th);
    // back rope, rider, front rope, seat
    ctx.strokeStyle = '#6f8797'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px + 3, py); ctx.lineTo(sx + 3 * Math.cos(th), sy - 3 * Math.sin(th)); ctx.stroke();
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-th);
    var u = Math.max(0.7, s / 62);
    ctx.fillStyle = '#b7814f'; ctx.beginPath(); ctx.ellipse(10 * u, -4 * u, 9 * u, 4.5 * u, 0, 0, TAU); ctx.fill();                       // legs
    ctx.fillStyle = '#c99260'; ctx.beginPath(); ctx.ellipse(0, -15 * u, 9.5 * u, 12 * u, 0, 0, TAU); ctx.fill();                       // body
    ctx.fillStyle = '#e8c49c'; ctx.beginPath(); ctx.ellipse(2 * u, -13 * u, 5 * u, 7 * u, 0, 0, TAU); ctx.fill();                      // tummy
    ctx.fillStyle = '#c99260'; ctx.beginPath(); ctx.arc(-6 * u, -38 * u, 4.2 * u, 0, TAU); ctx.arc(7 * u, -38 * u, 4.2 * u, 0, TAU); ctx.fill();  // ears
    ctx.fillStyle = '#d6a06c'; ctx.beginPath(); ctx.arc(0, -31 * u, 9 * u, 0, TAU); ctx.fill();                                         // head
    ctx.fillStyle = '#f0d6b4'; ctx.beginPath(); ctx.ellipse(6 * u, -29 * u, 4.2 * u, 3.4 * u, 0, 0, TAU); ctx.fill();                  // snout
    ctx.fillStyle = '#2b1d12'; ctx.beginPath(); ctx.arc(8.6 * u, -30 * u, 1.4 * u, 0, TAU); ctx.arc(3.5 * u, -34 * u, 1.2 * u, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#b7814f'; ctx.lineWidth = 3.2 * u; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(2 * u, -20 * u); ctx.lineTo(-1 * u, -27 * u); ctx.stroke();   // arm holding the rope
    ctx.restore();
    ctx.strokeStyle = '#c6d3dc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-th); ctx.fillStyle = '#9a6a41'; rr(-14 * u, -1 * u, 28 * u, 5 * u, 2 * u); ctx.fill(); ctx.restore();
    ctx.fillStyle = C.steel; ctx.beginPath(); ctx.arc(px, py, 5, 0, TAU); ctx.fill();
    // pushes
    if (d.motor) {
      var fm = d.F0 * Math.cos(d.psi), len = fm / 5 * 54;
      if (Math.abs(len) > 3) { arrow(sx + tx * 6 * Math.sign(len), sy + ty * 6 * Math.sign(len), sx + tx * (6 * Math.sign(len) + len), sy + ty * (6 * Math.sign(len) + len), 'rgba(255,212,121,.95)', 2.5); }
    }
    if (d.pushT > 0 || R.pushFlash > 0) {
      var al = d.pushT > 0 ? 1 : R.pushFlash;
      arrow(sx - tx * 74, sy - ty * 74, sx - tx * 16, sy - ty * 16, 'rgba(249,168,212,' + al + ')', 6);
      text('push!', sx - tx * 82, sy - ty * 82 - 8, 'rgba(249,168,212,' + al + ')', 13, 'center', 800);
      if (d.pushT <= 0) R.pushFlash = Math.max(0, R.pushFlash - dt / 0.5);
    }
    text(fmt(deg(th), 1) + '°', px + 10, py - 10, C.ink, 12, 'left', 700);
    if (!d.motor && R.pushes < 3) text('Your pushes go this way →', 12, ground - 8, C.pink, 11, 'left', 600);
    else if (d.motor) { text('━ motor\'s push', w - 12, ground - 22, 'rgba(255,212,121,.9)', 10.5, 'right', 600); text('━ your push', w - 12, ground - 8, 'rgba(249,168,212,.9)', 10.5, 'right', 600); }
    drawGraph(0, hs, w, h - hs, narrow);
  }
  function niceStep(r) { var e = Math.pow(10, Math.floor(Math.log10(r))), m = r / e; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e; }
  function drawGraph(x0, y0, gw, gh, narrow) {
    var f0 = PM.naturalFreq(R.L, GE), fLo = 0.5 * f0, fHi = 1.5 * f0, d = R.d;
    var gl = x0 + 44, gr = x0 + gw - 16, gt = y0 + 30, gb = y0 + gh - 30;
    rr(x0 + 8, y0 + 2, gw - 16, gh - 8, 12); ctx.fillStyle = C.panel; ctx.fill(); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.stroke();
    text(narrow ? 'RESONANCE CURVE' : 'RESONANCE CURVE · swing size against push rhythm', x0 + 20, y0 + 19, C.muted, 10.5, 'left', 700);
    if (R.sweep) text('sweeping ' + R.sweep.points.length + ' / ' + R.sweep.list.length, gr, y0 + 19, C.gold, 10.5, 'right', 600);
    else if (!R.series.length && d.motor) text(narrow ? 'a point appears when it settles' : 'A point appears when the swing settles at a rhythm', gr, y0 + 19, C.muted, 10, 'right', 500);
    var o = { g: GE, L: R.L, m: MASS, gamma: R.gamma, F0: R.F0 }, top = 4 * D2R, i, f;
    var fr = Math.sqrt(Math.max(0.01, GE / R.L - R.gamma * R.gamma / 2)) / TAU;
    if (R.theory) top = Math.max(top, PM.ampTheory(o, fr));
    R.series.forEach(function (ser) { ser.pts.forEach(function (p) { if (p.a > top) top = p.a; }); });
    top = Math.max(top, d.amplitude());
    var target = Math.min(150, deg(top) * 1.12); R.ymax += (target - R.ymax) * (reduced ? 1 : 0.15);
    var ymax = Math.max(5, R.ymax), X = function (f) { return gl + (gr - gl) * (f - fLo) / (fHi - fLo); }, Y = function (a) { return gb - (gb - gt) * Math.min(1.05, deg(a) / ymax); };
    R.gr = { l: gl, r: gr, t: gt - 10, b: gb + 10, fLo: fLo, fHi: fHi };
    // grid
    var ys = niceStep(ymax / 4);
    ctx.lineWidth = 1;
    for (var v = 0; v <= ymax + 1e-9; v += ys) { var yy = gb - (gb - gt) * v / ymax; ctx.strokeStyle = v === 0 ? 'rgba(143,179,198,.45)' : 'rgba(120,170,200,.12)'; ctx.beginPath(); ctx.moveTo(gl, yy); ctx.lineTo(gr, yy); ctx.stroke(); text(fmt(v, ys < 1 ? 1 : 0) + '°', gl - 6, yy + 4, C.muted, 10, 'right', 500); }
    var xs = niceStep((fHi - fLo) / (narrow ? 3 : 6));
    for (f = Math.ceil(fLo / xs) * xs; f <= fHi + 1e-9; f += xs) { var xx = X(f); text(fmt(f, 2), xx, gb + 14, C.muted, 10, 'center', 500); ctx.strokeStyle = 'rgba(120,170,200,.12)'; ctx.beginPath(); ctx.moveTo(xx, gb); ctx.lineTo(xx, gb + 4); ctx.stroke(); }
    text('push rhythm (Hz)', gr, gb + 26, C.muted, 10, 'right', 600);
    // own frequency
    var x0f = X(f0);
    ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(99,230,190,.55)'; ctx.beginPath(); ctx.moveTo(x0f, gt - 4); ctx.lineTo(x0f, gb); ctx.stroke(); ctx.setLineDash([]);
    text('own ' + fmt(f0, 3) + ' Hz', x0f + 5, gb - 6, C.green, 10, 'left', 600);
    // textbook curve
    if (R.theory) {
      ctx.beginPath();
      for (i = 0; i <= 240; i++) { f = fLo + (fHi - fLo) * i / 240; var yq = Y(PM.ampTheory(o, f)); if (i === 0) ctx.moveTo(X(f), yq); else ctx.lineTo(X(f), yq); }
      ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(219,231,239,.45)'; ctx.lineWidth = 1.4; ctx.stroke(); ctx.setLineDash([]);
    }
    // measured points
    ctx.save(); ctx.beginPath(); ctx.rect(gl - 6, gt - 12, gr - gl + 12, gb - gt + 14); ctx.clip();
    R.series.forEach(function (ser) {
      var sw = ser.pts.filter(function (p) { return !p.manual; }).sort(function (a, b) { return a.f - b.f; });
      if (sw.length > 1) { ctx.beginPath(); sw.forEach(function (p, k) { if (k) ctx.lineTo(X(p.f), Y(p.a)); else ctx.moveTo(X(p.f), Y(p.a)); }); ctx.strokeStyle = ser.color; ctx.lineWidth = 2.2; ctx.stroke(); }
      sw.forEach(function (p) { ctx.fillStyle = ser.color; ctx.beginPath(); ctx.arc(X(p.f), Y(p.a), 2, 0, TAU); ctx.fill(); });
      ser.pts.forEach(function (p) { if (!p.manual) return; ctx.fillStyle = ser.color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(p.f), Y(p.a), 5, 0, TAU); ctx.fill(); ctx.stroke(); });
    });
    // now: the push rhythm and the swing's size
    if (d.motor && R.f >= fLo && R.f <= fHi) {
      var xf = X(R.f), ya = Y(d.amplitude());
      ctx.strokeStyle = 'rgba(255,212,121,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xf, gt); ctx.lineTo(xf, gb); ctx.stroke();
      var pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(S.clock * 5);
      ctx.strokeStyle = 'rgba(249,168,212,' + (0.5 + 0.4 * pulse) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xf, ya, 7 + 2 * pulse, 0, TAU); ctx.stroke();
      ctx.fillStyle = C.pink; ctx.beginPath(); ctx.arc(xf, ya, 3, 0, TAU); ctx.fill();
      if (R.recFlash > 0) { ctx.strokeStyle = 'rgba(255,255,255,' + R.recFlash + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(xf, ya, 8 + (1 - R.recFlash) * 18, 0, TAU); ctx.stroke(); }
    }
    ctx.restore();
    R.recFlash = Math.max(0, R.recFlash - 0.02);
    // legend
    var ly = gt + 4, lx = gl + 8;
    R.series.slice(-3).forEach(function (ser) {
      text('damping ' + fmt(ser.gamma, 2) + ' /s · ' + fmt(ser.F0, 1) + ' N', lx, ly + 4, ser.color, 10, 'left', 600); ly += 14;
    });
  }

  function draw(dt) {
    backdrop();
    if (S.scene === 'wave') drawWave(dt); else if (S.scene === 'pair') drawPair(dt); else drawSwing(dt);
  }

  // ---------- the loop ----------
  LAB.loop(function (dt) {
    K.fit(); S.clock += dt;
    if (!S.paused && !S.holding) simulate(dt * SPEEDS[S.speedIx]);
    if (S.scene === 'swing' && R.sweep) runSweep();
    if (S.scene === 'wave') { var p = wavePattern(); if (p) { W.pattern = p; W.patClock = 1.6; } else if ((W.patClock -= dt) <= 0) W.pattern = ''; }
    if (S.scene === 'pair') pairChecks();
    if (S.scene === 'swing') { recordPoint(); swingChecks(); }
    draw(dt);
    S.hudClock += dt; if (S.hudClock > 0.12) { S.hudClock = 0; updateText(); }
    pumpToasts();
  }, view);

  // ---------- pointer ----------
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function freqAt(x) { var g = R.gr; return clamp(g.fLo + (g.fHi - g.fLo) * (x - g.l) / (g.r - g.l), 0.1, 0.8); }
  function hitBob(p) {
    if (!pairGeo) return -1; var best = -1, bd = 1e9;
    pairGeo.bob.forEach(function (b, i) { var d = Math.hypot(p.x - b.x, p.y - b.y); if (d < b.r + 22 && d < bd) { bd = d; best = i; } });
    return best;
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    try { cv.focus({ preventScroll: true }); } catch (err) { }
    if (S.scene === 'wave') {
      if (p.y < K.h * (K.w < 560 ? 0.58 : 0.64)) { S.drag = { type: 'cam', x: p.x, y: p.y, yaw: W.yaw, pitch: W.pitch }; W.yawT = W.pitchT = null; cv.classList.add('pend-grabbing'); pressSeg(el.cam, 'cam', ''); }
    } else if (S.scene === 'pair') {
      var i = hitBob(p);
      if (i >= 0) { S.drag = { type: 'bob', i: i }; S.holding = true; P.c.s[2] = P.c.s[3] = 0; cv.classList.add('pend-grabbing'); }
    } else {
      var g = R.gr;
      if (g && p.y > g.t - 6 && p.x > g.l - 20 && p.x < g.r + 10) { S.drag = { type: 'freq' }; setFreq(freqAt(p.x)); }
      else if (p.y < K.h * 0.56) doPush();
    }
    if (S.drag) { try { cv.setPointerCapture(e.pointerId); } catch (err) { } e.preventDefault(); }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pos(e);
    if (!S.drag) {
      if (S.scene === 'pair') cv.style.cursor = hitBob(p) >= 0 ? 'grab' : 'default';
      else cv.style.cursor = '';
      return;
    }
    if (S.drag.type === 'cam') {
      W.yaw = S.drag.yaw + (p.x - S.drag.x) * 0.008; W.pitch = clamp(S.drag.pitch + (p.y - S.drag.y) * 0.006, 2 * D2R, 85 * D2R);
    } else if (S.drag.type === 'bob') {
      var i = S.drag.i, g = pairGeo, b = g.bob[i], th = Math.atan2(p.x - b.px, p.y - g.py);
      P.c.s[i] = clamp(th, -45 * D2R, 45 * D2R); P.c.s[2] = P.c.s[3] = 0;
    } else if (S.drag.type === 'freq') setFreq(freqAt(p.x));
  });
  function endDrag() {
    if (!S.drag) return;
    if (S.drag.type === 'bob') {
      P.a = Math.round(deg(P.c.s[0])); P.b = Math.round(deg(P.c.s[1])); el.pA.value = P.a; el.pB.value = P.b;
      var thA = P.c.s[0], thB = P.c.s[1]; buildPair(); P.c.start(thA, thB); resetPairMeas();
      P.same = Math.abs(thA - thB) < 0.5 * D2R && Math.abs(thA) >= 5 * D2R;
      S.holding = false; outputs();
    }
    S.drag = null; cv.classList.remove('pend-grabbing');
  }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag); cv.addEventListener('lostpointercapture', endDrag);

  // ---------- keyboard ----------
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === ' ') setPaused(!S.paused);
    else if (k === 'r' || k === 'R') restart();
    else if (k === '1' || k === '2' || k === '3') loadScene(['wave', 'pair', 'swing'][+k - 1]);
    else if (S.scene === 'wave' && (k === 'ArrowLeft' || k === 'ArrowRight')) { W.yawT = null; W.yaw += (k === 'ArrowLeft' ? -1 : 1) * 6 * D2R; pressSeg(el.cam, 'cam', ''); }
    else if (S.scene === 'wave' && (k === 'ArrowUp' || k === 'ArrowDown')) { W.pitchT = W.yawT = null; W.pitch = clamp(W.pitch + (k === 'ArrowUp' ? 1 : -1) * 5 * D2R, 2 * D2R, 85 * D2R); pressSeg(el.cam, 'cam', ''); }
    else if (S.scene === 'pair' && (k === 'ArrowUp' || k === 'ArrowDown')) { el.pLen.value = clamp(+el.pLen.value + (k === 'ArrowUp' ? 0.5 : -0.5), 10, 250); el.pLen.dispatchEvent(new Event('input')); }
    else if (S.scene === 'swing' && (k === 'p' || k === 'P' || k === 'Enter')) doPush();
    else if (S.scene === 'swing' && (k === 'ArrowLeft' || k === 'ArrowRight')) setFreq(R.f + (k === 'ArrowLeft' ? -0.001 : 0.001));
    else if (S.scene === 'swing' && (k === 'ArrowUp' || k === 'ArrowDown')) { el.sD.value = clamp(+el.sD.value + (k === 'ArrowUp' ? 0.01 : -0.01), 0.04, 1); el.sD.dispatchEvent(new Event('input')); }
    else used = false;
    if (used) e.preventDefault();
  });

  // ---------- wiring the panel ----------
  el.scenes.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) loadScene(b.getAttribute('data-scene')); });
  el.pause.addEventListener('click', function () { setPaused(!S.paused); });
  el.speed.addEventListener('click', function () { setSpeed((S.speedIx + 1) % SPEEDS.length); });
  el.reset.addEventListener('click', restart);
  el.grav.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    S.grav = b.getAttribute('data-g'); st.set('grav', S.grav); outputs();
    if (S.scene === 'wave') buildWave(); else if (S.scene === 'pair') pairLive();
  });
  el.wAng.addEventListener('input', function () { W.deg = +el.wAng.value; buildWave(); outputs(); });
  el.wN.addEventListener('input', function () { W.n0 = +el.wN.value; buildWave(); outputs(); });
  el.jump.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var j = b.getAttribute('data-j'); jumpWave(j === 'almost' ? j : +j); });
  el.cam.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setCam(b.getAttribute('data-cam')); });
  el.pLen.addEventListener('input', function () { P.L = +el.pLen.value / 100; pairLive(); outputs(); });
  el.pK.addEventListener('input', function () { P.k = +el.pK.value; pairLive(); outputs(); });
  el.pMa.addEventListener('input', function () { P.mA = +el.pMa.value; pairLive(); outputs(); });
  el.pMb.addEventListener('input', function () { P.mB = +el.pMb.value; pairLive(); outputs(); });
  el.pA.addEventListener('input', function () { P.a = +el.pA.value; buildPair(); outputs(); });
  el.pB.addEventListener('input', function () { P.b = +el.pB.value; buildPair(); outputs(); });
  el.pStart.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; var m = b.getAttribute('data-start'), a = Math.abs(P.a) >= 5 ? Math.abs(P.a) : 15;
    if (m === 'one') setPair({ a: a, b: 0 }); else if (m === 'same') setPair({ a: a, b: a }); else setPair({ a: a, b: -a });
  });
  function setFreq(f) { R.f = Math.round(clamp(f, 0.1, 0.8) * 1000) / 1000; el.sF.value = R.f; R.d.f = R.f; R.d.changed(); outputs(); }
  el.sF.addEventListener('input', function () { setFreq(+el.sF.value); });
  el.sFm.addEventListener('click', function () { setFreq(R.f - 0.001); });
  el.sFp.addEventListener('click', function () { setFreq(R.f + 0.001); });
  el.sMotor.addEventListener('change', function () { R.motor = el.sMotor.checked; swingLive(false); });
  el.sAmp.addEventListener('input', function () { R.F0 = +el.sAmp.value; R.sweep = null; swingLive(false); outputs(); });
  el.sD.addEventListener('input', function () { R.gamma = +el.sD.value; R.sweep = null; swingLive(false); outputs(); });
  el.sL.addEventListener('input', function () { R.L = +el.sL.value; swingLive(true); outputs(); });
  el.sPush.addEventListener('click', doPush); el.push2.addEventListener('click', doPush);
  el.sSweep.addEventListener('click', startSweep);
  el.sClear.addEventListener('click', function () { R.series = []; R.sweep = null; });
  el.sTheory.addEventListener('change', function () { R.theory = el.sTheory.checked; });

  // ---------- start ----------
  var g0 = st.get('grav', 'earth'); if (PM.GRAV[g0]) S.grav = g0;
  var sp0 = st.get('speed', 2); setSpeed(sp0 >= 0 && sp0 < SPEEDS.length ? sp0 : 2);
  loadScene(st.get('scene', 'wave'));
})();
