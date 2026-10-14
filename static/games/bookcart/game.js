/* Book Cart: a chain of books hangs from a rolling shopping cart. Swing it up and keep it balanced above the cart.
   The physics is in physics.js (BCPhys). */
(function (W, D) {
  'use strict';
  var P = W.BCPhys, $ = function (id) { return D.getElementById(id); };
  var root = $('bc'); if (!root || !P) return;
  var LESSON = JSON.parse($('bc-lessons').textContent);
  // Level table, computed offline (see physics.js, System.modes). For n books on a free pivot: bindings just stiff enough, times a margin
  // that shrinks as the levels go on, that the stack has only one way to fall; the slow-motion factor near the top that makes a lean look
  // as if it doubles every 0.9 s (2 books) down to 0.5 s (25 books); the track's half-length; and a par time set from the autopilot
  // playing with a human-like 0.15 s reaction time.
  var LEVELS = [{"n":2,"seed":1002,"sBind":1.64,"speed":0.139,"xEnd":2.4,"par":33},{"n":3,"seed":1003,"sBind":2.245,"speed":0.171,"xEnd":2.4,"par":32},{"n":4,"seed":1004,"sBind":2.725,"speed":0.197,"xEnd":2.4,"par":32},{"n":5,"seed":1005,"sBind":3.22,"speed":0.239,"xEnd":2.4,"par":32},{"n":6,"seed":1006,"sBind":4.091,"speed":0.257,"xEnd":2.44,"par":32},{"n":7,"seed":1007,"sBind":4.336,"speed":0.286,"xEnd":2.63,"par":32},{"n":8,"seed":1008,"sBind":4.957,"speed":0.314,"xEnd":2.75,"par":32},{"n":9,"seed":1009,"sBind":5.327,"speed":0.345,"xEnd":2.9,"par":31},{"n":10,"seed":1010,"sBind":5.876,"speed":0.363,"xEnd":2.98,"par":26},{"n":11,"seed":1011,"sBind":6.436,"speed":0.391,"xEnd":3.19,"par":25},{"n":12,"seed":1012,"sBind":6.807,"speed":0.426,"xEnd":3.34,"par":26},{"n":13,"seed":1013,"sBind":6.977,"speed":0.429,"xEnd":3.39,"par":26},{"n":14,"seed":1014,"sBind":7.588,"speed":0.483,"xEnd":3.65,"par":27},{"n":15,"seed":1015,"sBind":7.908,"speed":0.491,"xEnd":3.71,"par":27},{"n":16,"seed":1016,"sBind":8.695,"speed":0.526,"xEnd":3.91,"par":32},{"n":17,"seed":1017,"sBind":8.749,"speed":0.551,"xEnd":3.95,"par":34},{"n":18,"seed":1018,"sBind":9.068,"speed":0.587,"xEnd":4.18,"par":27},{"n":19,"seed":1019,"sBind":8.841,"speed":0.635,"xEnd":4.35,"par":28},{"n":20,"seed":1020,"sBind":9.219,"speed":0.675,"xEnd":4.58,"par":34},{"n":21,"seed":1021,"sBind":9.972,"speed":0.727,"xEnd":4.81,"par":34},{"n":22,"seed":1022,"sBind":10.426,"speed":0.74,"xEnd":4.84,"par":33},{"n":23,"seed":1023,"sBind":10.13,"speed":0.786,"xEnd":5.01,"par":34},{"n":24,"seed":1024,"sBind":10.65,"speed":0.816,"xEnd":5.02,"par":34},{"n":25,"seed":1025,"sBind":10.732,"speed":0.872,"xEnd":5.23,"par":34}];
  function lv(n) { return LEVELS[Math.max(0, Math.min(23, n - 2))]; }
  // Goals for the levels: keep the books' centre of gravity within 15° for 8 s, or stand every book straight up (within 5° or 2°)
  // and hold it there for 3 s.
  var GOALS = {
    bal: { deg: 15, hold: 8, name: 'Balance', short: '⚖️ Balance it', par: 1 },
    s5: { deg: 5, hold: 3, name: 'Straight', short: '📏 Every book within 5°', par: 1.5 },
    s2: { deg: 2, hold: 3, name: 'Dead straight', short: '🎯 Every book within 2°', par: 1.5 }
  };
  var HOLD = 8, H = 1 / 360, ITERS = 2, ZETA = 0.08, CART = 15, PIV = 0.9, ZONE = 15 * Math.PI / 180, ZBEND = 20 * Math.PI / 180, ZTIP = 25 * Math.PI / 180;
  var SERVO = 12; // how briskly the cart follows your finger, per second of screen time
  var COLORS = ['#63e6be', '#ffa94d', '#f783ac', '#74c0fc', '#b197fc', '#c0eb75', '#ffe8cc', '#ffc078', '#66d9e8', '#faa2c1', '#ffd43b', '#ff8787', '#a9e34b', '#91a7ff', '#e599f7', '#8ce99a'];
  var FACTS = [
    'Pumping a swing works best in rhythm. Push the cart the same way each time the books pass the bottom, and each swing climbs a little higher. That’s resonance.',
    'To stand straight up and stop there, the books need exactly enough swing energy to lift their centre of gravity from below the pivot to above it: E = 2 m g h. The Swing bar fills up as you get there.',
    'A tall stack tips more slowly than a short one: the time it takes to fall grows with the square root of its height. That’s why a broom is easier to balance on your hand than a pencil.',
    'Real books on a free pivot fall very fast: a lean of two books doubles about every 0.13 s, quicker than anyone can react. So the game slows time down near the top. The physics is exactly the same, just shown in slow motion.',
    'An unbalanced lean doesn’t grow at a steady speed; it doubles again and again. Small, early corrections beat big, late ones.',
    'To move the cart right without dropping the books, you first nudge it left so the stack leans right, then follow it. Self-balancing scooters and robots do the same thing.',
    'Human reaction time is about 0.2 seconds. Measure yours by catching a dropped ruler: it falls d = ½ g t², so 20 cm means about 0.2 s.',
    'The motor force is not just mass × acceleration. When the books swing, they pull on the cart, so the force changes from moment to moment. Watch “F = (M+m)a would be” in the physics panel.',
    'A hanging chain of books is stable: nudge it and it swings back. Standing up, the same chain is unstable. Same books, same hinges; only which side of the pivot the weight is on has changed.',
    'Energy is never lost in the simulation, only moved: the panel adds kinetic, gravitational and spring energy, subtracts the work done by the motor, adds the heat from friction and damping, and checks that the total stays the same.'
  ];

  // ---------- saved progress ----------
  // unlocked is the next level to play (every level can be picked); rt: play the levels in real time, without slow motion
  var KEY = 'trb-bookcart-v2', SV = { unlocked: 2, best: {}, best5: {}, best2: {}, rt: false, goal: 'bal' };
  try { var raw = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (raw) { SV.unlocked = raw.unlocked || 2; SV.best = raw.best || {}; SV.best5 = raw.best5 || {}; SV.best2 = raw.best2 || {}; SV.rt = !!raw.rt; SV.goal = GOALS[raw.goal] ? raw.goal : 'bal'; } } catch (e) { }
  function goal() { return GOALS[SV.goal] || GOALS.bal; }
  function bests() { return SV.goal === 's5' ? SV.best5 : SV.goal === 's2' ? SV.best2 : SV.best; }
  function holdFor() { return G.mode === 'levels' ? goal().hold : HOLD; }
  function persist() { try { W.localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) { } }

  // ---------- canvas ----------
  var cv = $('bc-cv'), g = cv.getContext('2d'), DPR = 1, CW = 800, CH = 500;
  function resize() { var r = root.getBoundingClientRect(); DPR = Math.min(2, W.devicePixelRatio || 1); CW = Math.max(200, r.width); CH = Math.max(200, r.height); cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); }
  W.addEventListener('resize', resize); resize();

  // ---------- game state ----------
  var G = {
    mode: 'levels', n: 2, sys: null, st: null, phase: 'menu', paused: false,
    t: 0, tsim: 0, clock: 0, speed: 1, lvSpeed: 1, autoSlow: true, fixedSpeed: 1,
    input: { left: false, right: false, touch: false, tx: 0 }, keyHold: 0, auto: false, autoUsed: false, apMode: 'pump',
    wind: { v: 0, target: 0, next: 0, max: 0, gusty: false, steady: 0 },
    hist: [], trail: [], twin: null, E0: 0, peakF: 0, rate: 0, f1: 0, sample: 0, hold: 0, bestHold: 0, topE: 0, inZone: false, reached: false, worst: 0,
    cam: { S: 0, railY: 0, cx: 0 }, books: null, colors: null, colorOff: 0, streaks: []
  };
  for (var i = 0; i < 46; i++) G.streaks.push({ x: Math.random(), y: Math.random(), l: 0.3 + Math.random() * 0.7 });

  function build(books, o) {
    return new P.System({ books: books, M: CART, sBase: 0, sBind: o.sBind, zeta: o.zeta === undefined ? ZETA : o.zeta, g: o.g === undefined ? P.G : o.g, mc: o.mc || 0, rc: o.rc || 0, xEnd: o.xEnd });
  }
  function armFor(s) { return 0.3 + 0.15 * s.height; }
  function analyse() {
    var s = G.sys, md = s.modes(); G.rate = md.rate; G.unstable = md.unstable; G.f1 = md.freqs.length ? md.freqs[0] : 0;
    var J = s.inertia(), Pn = s.netMoment();
    G.ap = { J: J, P: Pn, k: J / Math.max(1e-6, Pn), lam2: md.rate * md.rate, w: Math.max(3, 1.5 * md.rate), K: undefined };
    G.period = Pn > 1e-6 && s.g > 0 ? 2 * Math.PI * Math.sqrt(J / (s.g * Pn)) : 0;
  }
  function newState(start) {
    var s = G.sys, st = s.newState(), n = s.n, r = Math.random, j;
    if (start === 'down') { var d = (r() < 0.5 ? -1 : 1) * (1 + 2 * r()) * Math.PI / 180; for (j = 1; j <= n; j++) st[j] = Math.PI + d; }
    else if (start === 'tilt') { for (j = 1; j <= n; j++) st[j] = 20 * Math.PI / 180; }
    else if (start === 'side') { for (j = 1; j <= n; j++) st[j] = Math.PI / 2; }
    else { var tip = (r() < 0.5 ? -1 : 1) * (0.25 + 0.35 * r()) * Math.PI / 180; for (j = 1; j <= n; j++) st[j] = tip; }
    return st;
  }
  function begin(st) {
    G.st = st; G.sys.initAcc(G.st); G.t = 0; G.tsim = 0; G.hist = []; G.trail = []; G.peakF = 0; G.sample = 0; G.hold = 0; G.bestHold = 0; G.topE = 0; G.reached = false;
    G.E0 = G.sys.energy(G.st).total; G.wind.v = G.wind.steady; G.wind.target = G.wind.steady; G.wind.next = 2 + Math.random() * 3;
    G.input.tx = st[0]; G.keyHold = 0; G.apMode = 'pump'; G.autoUsed = G.auto; G.speed = 1; G.blewUp = false; acc = 0; setPaused(false);
    if (!isFinite(G.cam.cx)) G.cam.cx = 0;
    if (G.twin) { var t2 = Float64Array.from(st); t2[1] += 1e-3 * Math.PI / 180; var tw = build(G.sys.books, { sBind: G.sys.sBind, zeta: G.sys.zeta, g: G.sys.g, mc: G.sys.mc, rc: G.sys.rc, xEnd: G.sys.xEnd }); G.twin = { sys: tw, st: t2 }; tw.initAcc(t2); }
  }
  function colorsFor(n, off) { G.colorOff = off || 0; var c = []; for (var j = 0; j < n; j++) c.push(COLORS[(j + (off || 0)) % COLORS.length]); return c; }

  function startLevel(n, quiet) {
    var L = lv(n); G.mode = 'levels'; G.n = n; G.twin = null; $('bc-lab').hidden = true;
    G.books = P.makeBooks(n, L.seed); G.colors = colorsFor(n, n);
    G.sys = build(G.books, { sBind: L.sBind, xEnd: L.xEnd }); analyse();
    levelSpeed(); G.wind.max = 0; G.wind.gusty = false; G.wind.steady = 0;
    begin(newState('down')); G.phase = 'ready'; G.cam.S = 0;
    if (!quiet) showIntro(); else hideOv();
  }

  // Levels run in slow motion near the top, or in real time if the player chose it.
  function levelSpeed() { if (SV.rt) { G.autoSlow = false; G.fixedSpeed = 1; } else { G.autoSlow = true; G.lvSpeed = lv(G.n).speed; } }

  // ---------- Lab ----------
  var LAB = { n: 5, bind: 3.22, cw: 0, z: 0.08, g: P.G, w: 0, gust: false, start: 'down', speed: 'auto', twin: false, auto: false };
  var lab = { n: $('bl-n'), bind: $('bl-bind'), cw: $('bl-cw'), z: $('bl-z'), g: $('bl-g'), w: $('bl-w'), gust: $('bl-gust'), start: $('bl-start'), speed: $('bl-speed'), twin: $('bl-twin'), auto: $('bl-auto') };
  function labToForm() {
    lab.n.value = LAB.n; lab.bind.value = Math.round(LAB.bind * 100); lab.cw.value = Math.round(LAB.cw * 10); lab.z.value = Math.round(LAB.z * 100);
    lab.g.value = String(LAB.g); lab.w.value = Math.round(LAB.w * 10); lab.gust.checked = LAB.gust; lab.start.value = LAB.start; lab.speed.value = String(LAB.speed); lab.twin.checked = LAB.twin; lab.auto.checked = LAB.auto;
    labLabels();
  }
  function labLabels() {
    $('bl-n-o').textContent = LAB.n; $('bl-bind-o').textContent = LAB.bind ? LAB.bind.toFixed(1) + '×' : 'free'; $('bl-cw-o').textContent = LAB.cw ? LAB.cw.toFixed(1) + ' kg' : 'none';
    $('bl-z-o').textContent = LAB.z.toFixed(2); $('bl-w-o').textContent = LAB.w.toFixed(1) + ' m/s';
  }
  function labSpeed() {
    if (LAB.speed === 'auto') { G.autoSlow = true; G.lvSpeed = G.rate > 0.01 ? Math.max(0.1, Math.min(1, Math.LN2 / G.rate / 0.6)) : 1; }
    else { G.autoSlow = false; G.fixedSpeed = +LAB.speed; }
  }
  function startLab(keepPanel) {
    G.mode = 'lab'; G.n = LAB.n; G.books = P.makeBooks(LAB.n, 500 + LAB.n); G.colors = colorsFor(LAB.n, 1);
    G.sys = build(G.books, { sBind: LAB.bind, zeta: LAB.z, g: LAB.g }); G.sys.setCounterweight(LAB.cw, armFor(G.sys)); analyse(); labSpeed();
    G.wind.steady = LAB.w; G.wind.max = LAB.gust ? Math.abs(LAB.w) + 2 : 0; G.wind.gusty = LAB.gust; G.auto = LAB.auto; G.twin = LAB.twin ? {} : null;
    begin(newState(LAB.start)); G.phase = 'play'; hideOv(); $('bc-lab').hidden = false; G.cam.S = 0;
    if (!keepPanel) setPanel(W.innerWidth > 900);
  }
  function resetE0() { var s = G.sys, N = s.N; G.E0 = s.energy(G.st).total - G.st[2 * N] + G.st[2 * N + 1]; }
  function labChanged(e) {
    var id = e.target.id;
    LAB.n = +lab.n.value; LAB.bind = lab.bind.value / 100; LAB.cw = lab.cw.value / 10; LAB.z = lab.z.value / 100; LAB.g = +lab.g.value;
    LAB.w = lab.w.value / 10; LAB.gust = lab.gust.checked; LAB.start = lab.start.value; LAB.speed = lab.speed.value === 'auto' ? 'auto' : +lab.speed.value; LAB.twin = lab.twin.checked; LAB.auto = lab.auto.checked;
    labLabels();
    if (id === 'bl-n' || id === 'bl-start' || id === 'bl-twin') { startLab(true); return; }
    var sys = [G.sys]; if (G.twin && G.twin.sys) sys.push(G.twin.sys);
    if (id === 'bl-bind' || id === 'bl-z') sys.forEach(function (s) { s.setStiffness(0, LAB.bind, LAB.z); });
    if (id === 'bl-cw') sys.forEach(function (s) { s.setCounterweight(LAB.cw, armFor(s)); });
    if (id === 'bl-g') sys.forEach(function (s) { s.g = LAB.g; });
    if (id === 'bl-bind' || id === 'bl-z' || id === 'bl-cw' || id === 'bl-g') { G.sys.initAcc(G.st); if (G.twin && G.twin.sys) G.twin.sys.initAcc(G.twin.st); analyse(); resetE0(); }
    G.wind.steady = LAB.w; G.wind.max = LAB.gust ? Math.abs(LAB.w) + 2 : 0; G.wind.gusty = LAB.gust; if (!LAB.gust) G.wind.target = LAB.w;
    labSpeed(); setAuto(LAB.auto);
  }
  ['n', 'bind', 'cw', 'z', 'w'].forEach(function (k) { lab[k].addEventListener('input', labChanged); });
  ['g', 'gust', 'start', 'speed', 'twin', 'auto'].forEach(function (k) { lab[k].addEventListener('change', labChanged); });
  var PRESETS = {
    swing: { n: 5, bind: 3.22, cw: 0, z: 0.08, g: P.G, w: 0, gust: false, start: 'down', speed: 'auto', twin: false, auto: true },
    pencil: { n: 1, bind: 0, cw: 0, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    broom: { n: 6, bind: 20, cw: 0, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    moon: { n: 6, bind: 20, cw: 0, z: 0.08, g: 1.62, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    counter: { n: 6, bind: 20, cw: 6, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    free: { n: 10, bind: 0, cw: 0, z: 0.02, g: P.G, w: 0, gust: false, start: 'side', speed: 1, twin: false, auto: false },
    chaos: { n: 3, bind: 0, cw: 0, z: 0, g: P.G, w: 0, gust: false, start: 'side', speed: 1, twin: true, auto: false },
    wind: { n: 12, bind: 6.81, cw: 0, z: 0.08, g: P.G, w: 7, gust: true, start: 'down', speed: 'auto', twin: false, auto: true }
  };
  PRESETS.hang = PRESETS.swing;
  function preset(k) { var p = PRESETS[k]; if (!p) return; for (var key in p) LAB[key] = p[key]; labToForm(); startLab(true); }
  D.querySelectorAll('[data-preset]').forEach(function (b) { b.addEventListener('click', function () { preset(b.dataset.preset); }); });
  $('bl-fold').addEventListener('click', function () { var l = $('bc-lab'), f = l.classList.toggle('fold'); this.setAttribute('aria-expanded', f ? 'false' : 'true'); this.setAttribute('aria-label', f ? 'Show the Lab settings' : 'Hide the Lab settings'); });

  // ---------- control ----------
  function control(q) {
    var s = G.sys, N = s.N;
    if (G.phase !== 'play') return { F: 0 };
    if (G.auto) return { a: autopilot(q) };
    // the motor drives the cart toward the target you set, like a stiff spring with a shock absorber; it's tuned in screen time,
    // so in slow motion the cart still keeps up with your finger
    var wc = SERVO / G.speed; return { a: wc * wc * (G.input.tx - q[0]) - 2 * 0.9 * wc * q[N] };
  }
  // The autopilot: away from the top it pumps energy into the swing, pushing the cart against the swing at the right moments until the
  // stack has just enough energy to reach the top; near the top it catches the books, steering the cart under their centre of gravity;
  // once they are nearly up, a regulator that watches every book (LQR, in physics.js) stands the whole stack straight and keeps it there.
  function wrapA(a) { return Math.atan2(Math.sin(a), Math.cos(a)); }
  function autopilot(q) {
    var s = G.sys, N = s.N, o = s.swing(q), ap = G.ap, j;
    if (G.apMode === 'pump' && Math.abs(o.psi) < 0.35 && Math.abs(o.rate) < 2.5) G.apMode = 'bal';
    if (G.apMode === 'bal' && Math.abs(o.psi) < 0.12 && Math.abs(o.rate) < 1) {
      if (ap.K === undefined) { try { ap.K = s.uprightGains(); } catch (e) { ap.K = null; } }
      if (ap.K) G.apMode = 'lqr';
    }
    if (G.apMode !== 'pump' && Math.abs(o.psi) > 0.7) G.apMode = 'pump';
    if (G.apMode === 'lqr') {
      var K = ap.K, fw = s.wind || 0, a = -K[0] * Math.max(-1.5, Math.min(1.5, q[0]));
      for (j = 1; j <= s.n; j++) a -= K[j] * (wrapA(q[j]) - fw * K.wind[j - 1]);
      for (j = N; j < 2 * N; j++) a -= K[j] * q[j];
      return a;
    }
    if (G.apMode === 'bal') {
      var ref = Math.max(-0.08, Math.min(0.08, -0.04 * q[0] - 0.08 * q[N])), w = ap.w;
      return ap.k * ((ap.lam2 + w * w) * (o.psi - ref) + 1.6 * w * o.rate);
    }
    if (!(o.Etop > 0)) return -0.8 * q[0] - q[N];
    var de = (o.Etop * 1.02 - o.E) / o.Etop, acc2 = -4 * Math.max(-1, Math.min(1, 3 * de)) * (o.rate * Math.cos(o.psi) >= 0 ? 1 : -1);
    if (Math.abs(o.rate) < 0.02 && Math.abs(o.psi) > 3) acc2 = 4;
    return acc2 - 0.8 * q[0] - q[N];
  }
  function bend(d) { return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); }
  function setPaused(v) { G.paused = v; var b = $('bc-pause'); b.textContent = v ? '▶' : '❚❚'; b.setAttribute('aria-label', v ? 'Resume' : 'Pause'); }
  function setAuto(v) {
    G.auto = v; if (v) { G.autoUsed = true; G.apMode = 'pump'; if (G.phase === 'ready') { hideOv(); G.phase = 'play'; } }
    $('bc-auto').setAttribute('aria-pressed', v ? 'true' : 'false'); if (G.mode === 'lab') { LAB.auto = v; lab.auto.checked = v; }
    if (!v) G.input.tx = G.st[0];
  }

  // ---------- simulation ----------
  // Slow motion: the game slows time near the top, where a human needs it, and runs nearly at real speed for the swing.
  function slowFor(psi) {
    var lo = G.lvSpeed, hi = Math.min(1, 2.5 * lo), a = Math.abs(psi) * 180 / Math.PI;
    if (!isFinite(a)) return 1;
    if (a > 70) return hi; if (a < 25) return lo;
    var u = (70 - a) / 45, sm = u * u * (3 - 2 * u); return hi + (lo - hi) * sm;
  }
  function updateWind(h) {
    var w = G.wind;
    if (w.max > 0 && w.gusty) {
      w.next -= h;
      if (w.next <= 0) { w.next = 3 + Math.random() * 4; var calm = Math.random() < 0.25; w.target = calm ? w.steady : w.steady + (Math.random() * 2 - 1) * w.max; }
      w.v += (w.target - w.v) * Math.min(1, h * 0.9);
    } else { w.v += (w.steady - w.v) * Math.min(1, h * 2); }
    G.sys.wind = G.sys.windForce(w.v); if (G.twin && G.twin.sys) G.twin.sys.wind = G.sys.wind;
  }
  function substeps(sys, st, h) {
    var w = 0, N = sys.N; for (var j = 1; j <= sys.n; j++) { var a = Math.abs(st[N + j]); if (a > w) w = a; }
    return w * h > 0.08 ? Math.min(24, Math.ceil(w * h / 0.08)) : 1;
  }
  function tick(h) {
    var s = G.sys, N = s.N, hs = h / G.speed, u = (G.input.right ? 1 : 0) - (G.input.left ? 1 : 0);
    if (u && G.phase === 'play' && !G.auto) { G.keyHold += hs; var lim = s.xEnd - 0.05, vk = (0.25 + 0.35 * s.height) * (0.6 + 1.4 * Math.min(1, G.keyHold)); G.input.tx = Math.max(-lim, Math.min(lim, G.input.tx + u * vk * hs)); } else G.keyHold = 0;
    updateWind(h);
    // When the books whirl fast, split the step so no book turns more than about 0.08 rad (5°) per step. Without this, a very
    // fast spin feeds numerical energy into the swing and it runs away; real books don't do that.
    var k = substeps(s, G.st, h), F;
    for (var i = 0; i < k; i++) s.stepNM(G.st, h / k, control, ITERS);
    if (G.twin && G.twin.sys) { F = s.lastF; var k2 = substeps(G.twin.sys, G.twin.st, h); for (i = 0; i < k2; i++) G.twin.sys.stepNM(G.twin.st, h / k2, function () { return { F: F }; }, ITERS); }
    G.tsim += h;
    for (var q = 0; q < G.st.length; q++) if (!isFinite(G.st[q])) { blowUp(); return; }
    if (G.twin && G.twin.sys && !(isFinite(G.twin.st[0]) && isFinite(G.twin.st[1]))) G.twin = null;
    var cm = s.comState(G.st), mb = 0; for (var j = 2; j <= s.n; j++) mb = Math.max(mb, bend(G.st[j] - G.st[j - 1]));
    var tp = s.points(G.st, PIV).pts[s.n], tipA = Math.abs(Math.atan2(tp[0] - G.st[0], tp[1] - PIV));
    // the worst-leaning book, in radians from straight up
    var worst = 0; for (j = 1; j <= s.n; j++) { var aj = Math.abs(wrapA(G.st[j])); if (aj > worst) worst = aj; } G.worst = worst;
    // Balance: the books' centre of gravity within 15° of straight up, no binding bent more than 20°, and the top book within 25°.
    // Straight: every single book within 5° (or 2°) of straight up.
    if (G.mode === 'levels' && SV.goal !== 'bal') G.inZone = worst < goal().deg * Math.PI / 180;
    else G.inZone = Math.abs(cm.lean) < ZONE && mb < ZBEND && tipA < ZTIP;
    if (G.phase === 'play') {
      G.t += hs; G.peakF = Math.max(G.peakF, Math.abs(s.lastF));
      if (G.inZone) { G.hold += hs; G.reached = true; } else G.hold = 0;
      G.bestHold = Math.max(G.bestHold, G.hold);
      if (G.mode === 'levels' && G.hold >= holdFor()) { clear(); return; }
    }
    G.clock += hs; G.sample += hs;
    if (G.sample >= 1 / 30) { G.sample = 0; G.hist.push([G.clock, cm.lean]); while (G.hist.length > 320) G.hist.shift(); var pp = s.points(G.st, PIV).pts; G.trail.push(pp[pp.length - 1]); if (G.trail.length > 60) G.trail.shift(); }
  }
  // the numbers ran away: stop the simulation (in every mode) and offer a fresh start
  function blowUp() { if (G.blewUp) return; G.blewUp = true; G.phase = 'done'; G.input.touch = G.input.left = G.input.right = false; showBlown(); }
  function parFor(n) { return Math.round(lv(n).par * goal().par); }
  function stars() { var par = parFor(G.n); return G.t <= par ? 3 : G.t <= 2 * par ? 2 : 1; }
  function clear() {
    G.phase = 'done'; var n = G.n, st = stars();
    if (!G.autoUsed) {
      var BS = bests(), b = BS[n] || { s: 0, t: 1e9 }, nb = { s: b.s, t: b.t, rt: !!b.rt || !G.autoSlow };
      if (st > b.s || (st === b.s && G.t < b.t)) { nb.s = st; nb.t = Math.round(G.t * 10) / 10; }
      BS[n] = nb; if (n + 1 > SV.unlocked && n < 25) SV.unlocked = n + 1; persist();
    }
    showClear(st);
  }

  // ---------- drawing ----------
  function cam() {
    var s = G.sys, strip = 64, sb = root.querySelector('.bc-status'), top = sb ? sb.offsetTop + sb.offsetHeight + 10 : 118, xr = s.xEnd + 0.6;
    // on a narrow screen the panels lie across the picture, so fit the scene between them
    if (CW <= 900) {
      var lp = $('bc-lab'), pp = $('bc-panel');
      if (!lp.hidden) top = Math.max(top, lp.offsetTop + lp.offsetHeight + 8);
      if (!pp.hidden) strip = Math.max(strip, CH - pp.offsetTop + 8);
      if (CH - strip - top < 160) { top = sb ? sb.offsetTop + sb.offsetHeight + 10 : 118; strip = 64; }
    }
    var c = G.cam, availH = CH - strip - top, availW = CW - 24;
    // On a phone (or any small or tall screen) frame the cart and the books as they are right now, so a stack standing up fills the
    // screen instead of leaving room for where it could swing. Zoom out quickly when the books swing wide, and back in gently.
    if (CW <= 900 || CH < 560) {
      var pts = s.points(G.st, PIV).pts, cx0 = G.st[0], bx0 = cx0 - 0.6, bx1 = cx0 + 0.6, by0 = -0.3, by1 = PIV + 0.3;
      for (var i = 1; i < pts.length; i++) { var px = pts[i][0], py = pts[i][1]; if (px - 0.25 < bx0) bx0 = px - 0.25; if (px + 0.25 > bx1) bx1 = px + 0.25; if (py - 0.2 < by0) by0 = py - 0.2; if (py + 0.3 > by1) by1 = py + 0.3; }
      if (!(isFinite(bx0) && isFinite(bx1) && isFinite(by0) && isFinite(by1))) return;
      var bw = Math.max(2.6, bx1 - bx0), bh = Math.max(2.4, by1 - by0), Sd = Math.min(availW / bw, availH / bh, 260);
      if (!(Sd > 0)) Sd = c.S || 40;
      c.S = c.S ? c.S + (Sd - c.S) * (Sd < c.S ? 0.22 : 0.035) : Sd;
      var ry = top + availH / 2 + (by0 + by1) / 2 * c.S;
      c.railY = c.railY ? c.railY + (ry - c.railY) * 0.18 : ry;
      var cxw = (bx0 + bx1) / 2; if (!isFinite(c.cx)) c.cx = cxw;
      c.cx += (cxw - c.cx) * 0.15;
      return;
    }
    // On a wide screen the stack can be anywhere on a circle around the pivot, so fit that circle (and the cart) top to bottom
    var reach = s.height, yhi = Math.max(PIV + reach + 0.15, 1.15), ylo = Math.min(PIV - Math.max(reach, s.mc > 0 ? s.rc : 0) - 0.15, -0.25);
    var fitH = availH / (yhi - ylo), fitW = availW / (2 * xr), S = Math.min(fitH, Math.max(fitW, fitH * 0.7)), railY = top + yhi * S;
    c.S = c.S ? c.S + (S - c.S) * 0.08 : S; c.railY = c.railY ? c.railY + (railY - c.railY) * 0.1 : railY;
    // if the whole track doesn't fit across, the camera follows the cart
    var hw = (CW / 2 - 12) / c.S, x = G.st[0], want = 0;
    if (hw < xr) { want = Math.max(x - hw * 0.4, Math.min(x + hw * 0.4, c.cx)); want = Math.max(-xr + hw, Math.min(xr - hw, want)); }
    if (!isFinite(c.cx)) c.cx = 0;
    c.cx += (want - c.cx) * 0.12;
  }
  function X(x) { return CW / 2 + (x - G.cam.cx) * G.cam.S; }
  function Y(y) { return G.cam.railY - y * G.cam.S; }
  function drawBackground() {
    var grd = g.createLinearGradient(0, 0, 0, CH); grd.addColorStop(0, '#081723'); grd.addColorStop(1, '#040b12'); g.fillStyle = grd; g.fillRect(0, 0, CW, CH);
    var S = G.cam.S, step = S > 160 ? 0.1 : S > 60 ? 0.25 : 0.5;
    g.lineWidth = 1;
    var x0 = Math.floor((G.cam.cx - CW / 2 / S) / step) * step, y0 = Math.floor(((G.cam.railY - CH) / S) / step) * step;
    for (var x = x0; X(x) < CW; x += step) { var major = Math.abs(x - Math.round(x)) < 1e-6; g.strokeStyle = major ? 'rgba(120,170,200,0.13)' : 'rgba(120,170,200,0.05)'; g.beginPath(); g.moveTo(Math.round(X(x)) + 0.5, 0); g.lineTo(Math.round(X(x)) + 0.5, CH); g.stroke(); }
    for (var y = y0; Y(y) > 0; y += step) { var mj = Math.abs(y - Math.round(y)) < 1e-6; g.strokeStyle = mj ? 'rgba(120,170,200,0.13)' : 'rgba(120,170,200,0.05)'; g.beginPath(); g.moveTo(0, Math.round(Y(y)) + 0.5); g.lineTo(CW, Math.round(Y(y)) + 0.5); g.stroke(); }
  }
  // an elevated track on two stands, so the books can hang below it
  function drawRail() {
    var s = G.sys, y = Y(0), xa = X(-s.xEnd - 0.6), xb = X(s.xEnd + 0.6);
    g.fillStyle = 'rgba(120,160,180,0.22)';
    [-1, 1].forEach(function (sg) { var px = X(sg * (s.xEnd + 0.55)); g.fillRect(px - 3, y, 6, CH - y); });
    g.fillStyle = '#2b4250'; g.fillRect(xa, y, xb - xa, Math.max(3, G.cam.S * 0.03));
    g.strokeStyle = 'rgba(170,210,230,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(xa, y + 0.5); g.lineTo(xb, y + 0.5); g.stroke();
    g.fillStyle = 'rgba(160,200,220,0.6)'; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    for (var m = Math.ceil(-s.xEnd); m <= s.xEnd; m++) { g.fillRect(X(m) - 0.5, y - 5, 1, 10); g.fillText((m > 0 ? '+' : '') + m + ' m', X(m), y + 9); }
    [-1, 1].forEach(function (sg) { var bx = X(sg * (s.xEnd + 0.45)); g.fillStyle = '#c2523c'; g.fillRect(bx - 4, y - 22, 8, 22); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(bx - 4, y - 22, 8, 4); });
  }
  function drawCart(x, ghost) {
    var S = G.cam.S, cx = X(x), sc = function (v) { return v * S; }, base = Y(0);
    g.save(); g.translate(cx, 0); if (ghost) g.globalAlpha = 0.25;
    var r = 0.075, wy = base - sc(r), wl = sc(0.32), rot = x / r;
    g.strokeStyle = '#8fb7c9'; g.lineWidth = Math.max(1.5, sc(0.018));
    g.beginPath(); g.moveTo(-sc(0.42), base - sc(0.17)); g.lineTo(sc(0.4), base - sc(0.17)); g.stroke();
    [-wl, wl].forEach(function (wx) {
      g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx * 0.9, base - sc(0.17)); g.stroke();
      g.fillStyle = '#1b2b36'; g.beginPath(); g.arc(wx, wy, sc(r), 0, 7); g.fill(); g.strokeStyle = '#9cc3d4'; g.stroke();
      g.strokeStyle = 'rgba(200,225,235,0.6)'; g.lineWidth = 1; g.beginPath(); for (var k = 0; k < 3; k++) { var a = rot + k * Math.PI / 3; g.moveTo(wx - Math.cos(a) * sc(r) * 0.8, wy - Math.sin(a) * sc(r) * 0.8); g.lineTo(wx + Math.cos(a) * sc(r) * 0.8, wy + Math.sin(a) * sc(r) * 0.8); } g.stroke();
      g.strokeStyle = '#8fb7c9'; g.lineWidth = Math.max(1.5, sc(0.018));
    });
    var bt = base - sc(0.95), bb = base - sc(0.3), tl = -sc(0.5), tr = sc(0.48), bl = -sc(0.4), br = sc(0.36);
    g.fillStyle = 'rgba(120,180,200,0.10)'; g.beginPath(); g.moveTo(tl, bt); g.lineTo(tr, bt); g.lineTo(br, bb); g.lineTo(bl, bb); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(170,215,230,0.55)'; g.lineWidth = 1;
    for (var f = 0.06; f < 1; f += 0.07) { g.beginPath(); g.moveTo(tl + (tr - tl) * f, bt); g.lineTo(bl + (br - bl) * f, bb); g.stroke(); }
    [0.33, 0.66].forEach(function (f) { g.beginPath(); g.moveTo(tl + (bl - tl) * f, bt + (bb - bt) * f); g.lineTo(tr + (br - tr) * f, bt + (bb - bt) * f); g.stroke(); });
    g.strokeStyle = '#a9d3e3'; g.lineWidth = Math.max(1.5, sc(0.02)); g.beginPath(); g.moveTo(tl, bt); g.lineTo(tr, bt); g.lineTo(br, bb); g.lineTo(bl, bb); g.closePath(); g.stroke();
    g.beginPath(); g.moveTo(tl, bt); g.lineTo(tl - sc(0.16), bt - sc(0.12)); g.stroke();
    g.strokeStyle = '#e8735a'; g.lineWidth = Math.max(3, sc(0.04)); g.lineCap = 'round'; g.beginPath(); g.moveTo(tl - sc(0.16), bt - sc(0.12)); g.lineTo(tl - sc(0.19), bt - sc(0.14)); g.stroke(); g.lineCap = 'butt';
    // a mast from the basket floor up to the pivot bearing
    g.fillStyle = '#4d6573'; g.fillRect(-sc(0.02), base - sc(PIV), sc(0.04), sc(PIV - 0.32)); g.fillRect(-sc(0.09), base - sc(0.34), sc(0.18), sc(0.03));
    g.restore();
  }
  function drawCounterweight(sys, st, pp) {
    if (!(sys.mc > 0)) return;
    var a = [X(pp.pts[0][0]), Y(pp.pts[0][1])], b = [X(pp.cw[0]), Y(pp.cw[1])], r = Math.max(6, G.cam.S * 0.05 * Math.cbrt(sys.mc));
    g.strokeStyle = '#7f95a3'; g.lineWidth = Math.max(2, G.cam.S * 0.015); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    var gr = g.createRadialGradient(b[0] - r * 0.3, b[1] - r * 0.3, r * 0.1, b[0], b[1], r); gr.addColorStop(0, '#d9c58a'); gr.addColorStop(1, '#6b5a2e');
    g.fillStyle = gr; g.beginPath(); g.arc(b[0], b[1], r, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 1; g.stroke();
  }
  function drawHub(pp) {
    var p = pp.pts[0], r = Math.max(4, Math.min(9, G.cam.S * 0.03));
    g.fillStyle = '#0b1220'; g.beginPath(); g.arc(X(p[0]), Y(p[1]), r, 0, 7); g.fill(); g.strokeStyle = '#ffd479'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#ffd479'; g.beginPath(); g.arc(X(p[0]), Y(p[1]), r * 0.35, 0, 7); g.fill();
  }
  // A book seen cover-on: coloured board, a darker spine down one side, a title label and a gold rule.
  function bookRect(p0, p1, bk, col, alpha, k) {
    var S = G.cam.S, dx = X(p1[0]) - X(p0[0]), dy = Y(p1[1]) - Y(p0[1]), hh = Math.hypot(dx, dy), w = Math.max(7, bk.w * S), ang = Math.atan2(dx, -dy);
    g.save(); g.translate((X(p0[0]) + X(p1[0])) / 2, (Y(p0[1]) + Y(p1[1])) / 2); g.rotate(ang); g.globalAlpha = alpha;
    var r = Math.min(3, w / 6), x0 = -w / 2, y0 = -hh / 2;
    g.fillStyle = col; roundRect(x0, y0, w, hh, r); g.fill();
    var sh = g.createLinearGradient(x0, 0, x0 + w, 0); sh.addColorStop(0, 'rgba(255,255,255,0.10)'); sh.addColorStop(0.55, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.16)');
    g.fillStyle = sh; roundRect(x0, y0, w, hh, r); g.fill();
    var sp = Math.max(2, w * 0.12), left = (k || 0) % 2 === 0;
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(left ? x0 : -x0 - sp, y0 + 0.5, sp, hh - 1);
    if (hh > 24 && w > 16) {
      var cx = left ? sp / 2 : -sp / 2, lw = (w - sp) * 0.66, style = (k || 0) % 3;
      var ty = y0 + hh * (style === 2 ? 0.52 : 0.16), th = hh * 0.2;
      g.fillStyle = 'rgba(255,248,230,0.92)'; g.fillRect(cx - lw / 2, ty, lw, th);
      g.fillStyle = 'rgba(30,30,40,0.55)'; var ln = Math.max(1, th * 0.12);
      g.fillRect(cx - lw * 0.36, ty + th * 0.3, lw * 0.72, ln); g.fillRect(cx - lw * 0.24, ty + th * 0.6, lw * 0.48, ln);
      g.fillStyle = 'rgba(255,215,120,0.75)'; var gy = style === 2 ? y0 + hh * 0.2 : y0 + hh * 0.82;
      g.fillRect(cx - lw / 2, gy, lw, Math.max(1, hh * 0.012));
      if (style === 1) { g.beginPath(); g.arc(cx, y0 + hh * 0.6, Math.min(lw, hh) * 0.12, 0, 7); g.strokeStyle = 'rgba(255,215,120,0.7)'; g.lineWidth = Math.max(1, w * 0.02); g.stroke(); }
    }
    g.strokeStyle = 'rgba(5,12,20,0.6)'; g.lineWidth = 1; roundRect(x0, y0, w, hh, r); g.stroke();
    g.restore();
  }
  function roundRect(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath(); }
  function straightGoal() { return G.mode === 'levels' && SV.goal !== 'bal'; }
  function outlineBook(p0, p1, bk) {
    var S = G.cam.S, dx = X(p1[0]) - X(p0[0]), dy = Y(p1[1]) - Y(p0[1]), hh = Math.hypot(dx, dy), w = Math.max(7, bk.w * S);
    g.save(); g.translate((X(p0[0]) + X(p1[0])) / 2, (Y(p0[1]) + Y(p1[1])) / 2); g.rotate(Math.atan2(dx, -dy)); roundRect(-w / 2 - 1.5, -hh / 2 - 1.5, w + 3, hh + 3, Math.min(4, w / 5)); g.stroke(); g.restore();
  }
  function drawStack(sys, st, ghost) {
    var pp = sys.points(st, PIV), pts = pp.pts, n = sys.n;
    if (!ghost) drawCounterweight(sys, st, pp);
    for (var j = 1; j <= n; j++) bookRect(pts[j - 1], pts[j], sys.books[j - 1], ghost ? '#dfe9f0' : G.colors[j - 1], ghost ? 0.28 : 1, j + G.colorOff);
    if (ghost) return pp;
    var jr = Math.max(2.5, Math.min(5, G.cam.S * 0.012));
    for (j = 1; j < n; j++) { var px = X(pts[j][0]), py = Y(pts[j][1]); g.fillStyle = '#0b1220'; g.beginPath(); g.arc(px, py, jr, 0, 7); g.fill(); g.strokeStyle = '#d5e6ef'; g.lineWidth = 1.2; g.stroke(); }
    // Straight goals: near the top, outline in red every book that leans more than allowed
    if (straightGoal() && G.phase !== 'ready' && Math.abs(sys.comState(st).lean) < 0.6) {
      var lim = goal().deg * Math.PI / 180; g.strokeStyle = '#ff6b6b'; g.lineWidth = 2;
      for (j = 1; j <= n; j++) if (Math.abs(wrapA(st[j])) >= lim) outlineBook(pts[j - 1], pts[j], sys.books[j - 1]);
    }
    var tp = pts[n]; g.fillStyle = '#f9a8d4'; g.shadowColor = '#f9a8d4'; g.shadowBlur = 10; g.beginPath(); g.arc(X(tp[0]), Y(tp[1]), jr + 1, 0, 7); g.fill(); g.shadowBlur = 0;
    drawHub(pp);
    return pp;
  }
  // the balance zone: a wedge 15° either side of straight up, with the hold time filling it
  function drawZone() {
    var zr = G.mode === 'levels' ? goal().deg * Math.PI / 180 : ZONE, s = G.sys, p = [X(G.st[0]), Y(PIV)], R = (s.height + 0.12) * G.cam.S, a0 = -Math.PI / 2 - zr, a1 = -Math.PI / 2 + zr, on = G.inZone && G.phase !== 'ready';
    g.beginPath(); g.moveTo(p[0], p[1]); g.arc(p[0], p[1], R, a0, a1); g.closePath();
    g.fillStyle = on ? 'rgba(99,230,190,0.13)' : 'rgba(99,230,190,0.05)'; g.fill();
    g.setLineDash([5, 6]); g.strokeStyle = on ? 'rgba(99,230,190,0.75)' : 'rgba(99,230,190,0.3)'; g.lineWidth = 1.2; g.stroke(); g.setLineDash([]);
    if (straightGoal()) { g.setLineDash([2, 5]); g.strokeStyle = 'rgba(230,245,255,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - R); g.stroke(); g.setLineDash([]); }
    if (G.mode === 'levels' && G.hold > 0) {
      var HD = holdFor(), k = Math.min(1, G.hold / HD);
      g.strokeStyle = '#c0eb75'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.arc(p[0], p[1], R + 8, a0, a0 + (a1 - a0) * k); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = '#c0eb75'; g.font = '700 13px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.textBaseline = 'bottom';
      g.fillText((HD - G.hold).toFixed(1) + ' s', p[0], p[1] - R - 16);
    }
  }
  function drawCom(pp) {
    var c = pp.com, px = X(c[0]), py = Y(c[1]), pv = pp.pts[0], lean = G.sys.comState(G.st).lean;
    g.strokeStyle = 'rgba(255,212,121,0.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(pv[0]), Y(pv[1])); g.lineTo(px, py); g.stroke();
    g.strokeStyle = '#ffd479'; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 6, 0, 7); g.moveTo(px - 10, py); g.lineTo(px + 10, py); g.moveTo(px, py - 10); g.lineTo(px, py + 10); g.stroke();
    g.font = '600 12px ui-monospace,Menlo,monospace'; g.textBaseline = 'middle';
    if (straightGoal()) {
      // the angle that counts here is the worst book's, shown at the top of the stack
      var tp = pp.pts[pp.pts.length - 1], right = tp[0] >= pv[0], ok = G.worst < goal().deg * Math.PI / 180, wd = G.worst * 180 / Math.PI;
      g.fillStyle = ok ? '#63e6be' : '#ffa94d'; g.textAlign = right ? 'left' : 'right';
      g.fillText('worst ' + (wd < 9.95 ? wd.toFixed(1) : wd.toFixed(0)) + '°', X(tp[0]) + (right ? 12 : -12), Y(tp[1]));
      return;
    }
    g.fillStyle = '#ffd479'; g.textAlign = c[0] >= pv[0] ? 'left' : 'right';
    g.fillText((lean < 0 ? '−' : '') + Math.abs(lean * 180 / Math.PI).toFixed(0) + '°', px + (c[0] >= pv[0] ? 13 : -13), py);
  }
  function drawForce() {
    var s = G.sys, F = s.lastF || 0; if (Math.abs(F) < 0.5) return;
    var y = Y(0.55), x0 = X(G.st[0]) + (F > 0 ? G.cam.S * 0.52 : -G.cam.S * 0.56), len = Math.max(-1, Math.min(1, F / s.Fmax)) * Math.min(140, G.cam.S * 1.1);
    g.strokeStyle = '#63e6be'; g.fillStyle = '#63e6be'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + len, y); g.stroke();
    var d = len > 0 ? 1 : -1; g.beginPath(); g.moveTo(x0 + len + d * 8, y); g.lineTo(x0 + len - d * 2, y - 6); g.lineTo(x0 + len - d * 2, y + 6); g.closePath(); g.fill();
    g.font = '600 11px ui-monospace,Menlo,monospace'; g.textAlign = 'center'; g.textBaseline = 'bottom'; g.fillText('F ' + Math.round(F) + ' N', x0 + len / 2, y - 6);
  }
  function drawWind(dt) {
    var v = G.wind.v; if (Math.abs(v) < 0.2) return;
    g.strokeStyle = 'rgba(200,230,245,' + Math.min(0.35, Math.abs(v) / 12) + ')'; g.lineWidth = 1;
    G.streaks.forEach(function (p) {
      p.x += v * dt * G.speed * G.cam.S / CW * 1.5; if (p.x > 1.05) p.x -= 1.1; if (p.x < -0.05) p.x += 1.1;
      var x = p.x * CW, y = 120 + p.y * (CH - 190), L = p.l * Math.min(60, Math.abs(v) * 8) * (v > 0 ? 1 : -1);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - L, y); g.stroke();
    });
  }
  function drawTrail() {
    if (G.trail.length < 2) return; g.lineWidth = 2;
    for (var i = 1; i < G.trail.length; i++) { var a = i / G.trail.length; g.strokeStyle = 'rgba(249,168,212,' + (a * 0.5) + ')'; g.beginPath(); g.moveTo(X(G.trail[i - 1][0]), Y(G.trail[i - 1][1])); g.lineTo(X(G.trail[i][0]), Y(G.trail[i][1])); g.stroke(); }
  }
  function drawTarget() {
    if (G.phase !== 'play' || G.auto || !(G.input.touch || G.input.left || G.input.right)) return;
    var x = X(G.input.tx), y = Y(0); g.setLineDash([3, 4]); g.strokeStyle = 'rgba(99,230,190,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - G.cam.S * 1.1); g.lineTo(x, y + 30); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#63e6be'; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x - 7, y + 16); g.lineTo(x + 7, y + 16); g.closePath(); g.fill();
  }
  function render(dt) {
    cam(); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawBackground(); drawWind(dt); drawRail();
    if (G.twin && G.twin.sys) { drawCart(G.twin.st[0], true); drawStack(G.twin.sys, G.twin.st, true); }
    drawCart(G.st[0]); drawZone(); drawTrail();
    var pp = drawStack(G.sys, G.st, false); drawCom(pp); drawForce(); drawTarget();
    if (G.auto && G.phase === 'play') { g.fillStyle = 'rgba(255,212,121,0.9)'; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('AUTOPILOT', X(G.st[0]), Y(0) + 26); }
  }

  // ---------- HUD and physics panel ----------
  var vals = $('bc-vals'), energy = $('bc-energy'), chart = $('bc-chart'), cg = chart.getContext('2d'), hudT = 0;
  function fmt(v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); }
  function row(label, value, formula) { return '<dt>' + label + (formula ? '<span class="f">' + formula + '</span>' : '') + '</dt><dd>' + value + '</dd>'; }
  function slowText(sp) { return sp > 0.95 ? '' : 'slow motion ×' + (sp >= 0.1 ? sp.toFixed(2) : sp.toFixed(3)); }
  function hud() {
    var s = G.sys, st = G.st, N = s.N, sw = s.swing(st);
    $('bc-mode').textContent = G.mode === 'levels' ? 'Level ' + (G.n - 1) + ' of 24' : 'Lab';
    $('bc-title').textContent = s.n + (s.n === 1 ? ' book' : ' books');
    $('bc-time').textContent = G.t.toFixed(1) + ' s';
    var sl = $('bc-slow'), stxt = slowText(G.speed); sl.hidden = !stxt; sl.textContent = stxt;
    var ef = sw.Etop > 0 ? sw.E / sw.Etop : 0; G.topE = ef;
    var sb = $('bc-swing'); sb.style.width = Math.min(100, ef / 1.15 * 100) + '%'; sb.classList.toggle('full', ef >= 0.97);
    $('bc-prog').style.width = Math.min(100, G.hold / holdFor() * 100) + '%';
    var msg = '';
    if (G.mode === 'levels') {
      if (G.phase === 'ready') msg = 'Slide to start swinging the books.' + (G.autoSlow ? '' : ' Real time: no slow motion.');
      else if (G.phase === 'done') msg = G.blewUp ? '' : SV.goal === 'bal' ? 'Balanced!' : 'Straight!';
      else if (G.inZone) msg = (SV.goal === 'bal' ? 'Balancing! Hold it for ' : 'Straight! Hold it for ') + (holdFor() - G.hold).toFixed(1) + ' s more.';
      else if (SV.goal !== 'bal' && Math.abs(sw.psi) < 0.35) msg = 'Straighten them: the worst book leans ' + (G.worst * 180 / Math.PI).toFixed(0) + '°. Every book must be within ' + goal().deg + '°.';
      else if (ef < 0.85) msg = 'Swing them higher: push in time with the swing.';
      else if (ef > 1.25 && Math.abs(sw.psi) > 0.6) msg = 'Too much swing: they’ll go over the top. Slow them down.';
      else msg = 'Nearly there: catch them at the top.';
    } else msg = G.auto ? 'Autopilot: ' + (G.apMode === 'lqr' ? 'standing every book straight' : G.apMode === 'bal' ? 'catching the books' : 'pumping the swing') : '';
    $('bc-msg').textContent = msg;
    if ($('bc-panel').hidden) return;
    var cm = s.comState(st), F = s.lastF || 0, a = s.lastAcc || 0, E = s.energy(st), Wk = st[2 * N], Ls = st[2 * N + 1];
    var maxBend = 0; for (var j = 2; j <= s.n; j++) maxBend = Math.max(maxBend, bend(st[j] - st[j - 1]));
    var html = '<dt class="sec">Cart</dt>' + row('Position x', fmt(st[0]) + ' m') + row('Speed v', fmt(st[N]) + ' m/s') + row('Acceleration a', fmt(a, 1) + ' m/s²') +
      row('Motor force F', fmt(F, 0) + ' N') + row('F = (M+m)a would be', fmt(s.mTot * a, 0) + ' N', 'the gap is the books pulling on the cart') +
      '<dt class="sec">Books</dt>' + row('Mass m', s.mBooks.toFixed(1) + ' kg') + row('Height', s.height.toFixed(2) + ' m') + row('Angle from straight up', fmt(cm.lean * 180 / Math.PI, 0) + '°') +
      row('Turning rate', fmt(cm.leanRate * 180 / Math.PI, 0) + '°/s') + row('Gravity torque', fmt(s.mBooks * s.g * cm.x, 1) + ' N·m', 'τ = m g × sideways offset') + row('Sharpest bend', (maxBend * 180 / Math.PI).toFixed(0) + '°') +
      '<dt class="sec">Swing</dt>' + row('Swing energy', sw.E.toFixed(2) + ' J', 'E = ½ J ω² + g P (cos φ + 1)') + row('Needed to reach the top', sw.Etop.toFixed(2) + ' J', '2 g P: lifts the centre of gravity over the pivot') +
      row('Swing period hanging', G.period ? G.period.toFixed(2) + ' s' : '—', 'T = 2π √(J ÷ g P), small swings') +
      (s.mc > 0 ? row('Counterweight', s.mc.toFixed(1) + ' kg at ' + s.rc.toFixed(2) + ' m') : '') +
      '<dt class="sec">At the top</dt>' + row('Doubling time', G.rate > 0.01 ? (Math.LN2 / G.rate).toFixed(3) + ' s' : 'stable', 't₂ = ln 2 / λ, standing straight up with the cart held still') + row('Slowest wobble', G.f1 ? G.f1.toFixed(2) + ' Hz' : '—') +
      '<dt class="sec">Time</dt>' + row('Shown at', G.speed > 0.95 ? 'real speed' : '×' + G.speed.toFixed(2), 'slower near the top so you can react') + row('Simulated time', G.tsim.toFixed(2) + ' s') + row('Gravity g', s.g.toFixed(2) + ' m/s²') +
      (G.wind.max || G.wind.steady ? '<dt class="sec">Air</dt>' + row('Wind', fmt(G.wind.v, 1) + ' m/s') + row('Push per book', fmt(s.wind || 0, 2) + ' N', 'F = ½ ρ C_d A v²') : '');
    vals.innerHTML = html;
    var mx = Math.max(1, E.ke, Math.abs(E.pg), E.ps, Math.abs(Wk), Ls);
    function bar(label, v, col) { return '<div class="row"><span>' + label + '</span><span class="bar"><i style="width:' + Math.min(100, Math.abs(v) / mx * 100) + '%;background:' + col + '"></i></span><span class="num">' + fmt(v, 1) + ' J</span></div>'; }
    var resid = E.total - G.E0 - Wk + Ls;
    energy.innerHTML = '<b style="font-size:.75rem;color:#63e6be;text-transform:uppercase;letter-spacing:.06em">Energy</b>' + bar('Kinetic', E.ke, '#74c0fc') + bar('Gravitational', E.pg, '#ffd479') + bar('Springs', E.ps, '#b197fc') +
      bar('Work by motor', Wk, '#63e6be') + bar('Lost to friction', Ls, '#ff8787') +
      '<div class="chk">Energy check: kinetic + gravitational + springs − work in + lost should stay at ' + fmt(G.E0, 1) + ' J. It’s off by ' + Math.abs(resid).toFixed(3) + ' J.</div>';
    drawChart();
  }
  function drawChart() {
    var w = chart.clientWidth || 240, h = chart.clientHeight || 70; if (chart.width !== Math.round(w * DPR)) { chart.width = Math.round(w * DPR); chart.height = Math.round(h * DPR); }
    cg.setTransform(DPR, 0, 0, DPR, 0, 0); cg.clearRect(0, 0, w, h);
    var Yc = function (v) { return h / 2 - v / Math.PI * (h / 2 - 3); };
    var zb = straightGoal() ? goal().deg * Math.PI / 180 : ZONE; cg.fillStyle = 'rgba(99,230,190,0.18)'; cg.fillRect(0, Yc(zb), w, Yc(-zb) - Yc(zb));
    cg.strokeStyle = 'rgba(255,255,255,0.12)'; cg.beginPath(); cg.moveTo(0, Yc(Math.PI / 2)); cg.lineTo(w, Yc(Math.PI / 2)); cg.moveTo(0, Yc(-Math.PI / 2)); cg.lineTo(w, Yc(-Math.PI / 2)); cg.stroke();
    cg.fillStyle = 'rgba(200,220,230,0.5)'; cg.font = '9px system-ui,sans-serif'; cg.fillText('up', 2, Yc(0) - 2); cg.fillText('down', 2, h - 2);
    if (G.hist.length < 2) return; var t1 = G.hist[G.hist.length - 1][0], t0 = t1 - 10;
    cg.strokeStyle = '#ffd479'; cg.lineWidth = 1.6; cg.beginPath(); var prev = null;
    G.hist.forEach(function (p) { if (p[0] < t0) return; var x = (p[0] - t0) / 10 * w, y = Yc(p[1]); if (prev !== null && Math.abs(p[1] - prev) > Math.PI) cg.moveTo(x, y); else if (prev === null) cg.moveTo(x, y); else cg.lineTo(x, y); prev = p[1]; }); cg.stroke();
  }
  function setPanel(on) { $('bc-panel').hidden = !on; $('bc-sci').setAttribute('aria-pressed', on ? 'true' : 'false'); }

  // ---------- overlays ----------
  var ov = $('bc-ov');
  function showOv(html, kind) { ov.dataset.kind = kind || ''; ov.innerHTML = '<div class="bc-card">' + html + '</div>'; ov.classList.add('on'); var f = ov.querySelector('.go,button'); if (f) f.focus({ preventScroll: true }); }
  // ready to start: the level's Start card is showing (or nothing is), not the menu
  function ready() { return G.phase === 'ready' && (!ov.classList.contains('on') || ov.dataset.kind === 'intro'); }
  function hideOv() { ov.classList.remove('on'); }
  function go() { hideOv(); if (G.phase === 'ready') G.phase = 'play'; setPaused(false); }
  function levelGrid() {
    var h = '<div class="bc-levels">';
    for (var n = 2, BS = bests(); n <= 25; n++) { var b = BS[n], st = b ? '★★★'.slice(0, b.s) + (b.rt ? '⚡' : '') : ''; h += '<button type="button" data-lv="' + n + '"' + (n === G.n && G.mode === 'levels' ? ' class="cur"' : '') + (b && b.rt ? ' title="Balanced in real time"' : '') + '>' + n + '<small>' + st + '</small></button>'; }
    return h + '</div>';
  }
  // the levels' time setting: slow motion near the top (the default) or real time
  function timePick() {
    var h = '<div class="bc-timepick" role="group" aria-label="Goal"><span>Goal:</span>';
    for (var k in GOALS) h += '<button type="button" data-goal="' + k + '" aria-pressed="' + (SV.goal === k) + '">' + GOALS[k].short + '</button>';
    return h + '</div><div class="bc-timepick" role="group" aria-label="Time"><span>Time:</span><button type="button" data-rt="0" aria-pressed="' + !SV.rt + '">🐢 Slow motion near the top</button><button type="button" data-rt="1" aria-pressed="' + SV.rt + '">⚡ Real time</button></div>';
  }
  function goalText() {
    var gl = goal();
    return SV.goal === 'bal' ? 'catch them at the top and keep their centre of gravity within 15° of straight up for ' + gl.hold + ' seconds'
      : 'stand them up straight: every single book within ' + gl.deg + '° of vertical, held for ' + gl.hold + ' seconds';
  }
  function showMenu() {
    if (G.phase === 'play') setPaused(true);
    showOv('<h2 id="bc-ov-h">🛒 Book Cart</h2><p>A chain of books hangs from a shopping cart. Roll the cart to swing the books up, then keep them balanced above the cart. Every book obeys real physics: gravity, inertia, springy bindings and friction.</p>' +
      '<div class="bc-modes"><button type="button" data-mode="levels" class="on"><b>Levels</b><small>2 to 25 books, in any order. Swing them up, then balance them above the cart or stand every book straight.</small></button>' +
      '<button type="button" data-mode="lab"><b>Lab</b><small>Change gravity, stiffness, counterweight and wind. Stand the books up, watch chaos, or let the autopilot try.</small></button></div>' +
      '<h3>Pick a level <span class="small">(number of books)</span></h3>' + levelGrid() + timePick() +
      '<p class="small">Phone or mouse: press anywhere on the game and slide left or right; the cart moves with you. Keyboard: hold ← →. 🔬 shows the live physics, 🤖 the autopilot. Stars are kept for each goal; ⚡ marks a level done in real time. <a href="' + LESSON + '">Learn the physics →</a></p>', 'menu');
  }
  function showIntro() {
    var s = G.sys, L = lv(G.n);
    showOv('<h2 id="bc-ov-h">Level ' + (G.n - 1) + ': ' + G.n + ' books</h2>' +
      '<div class="bc-stats"><div><b>' + s.height.toFixed(2) + ' m</b><span>long</span></div><div><b>' + s.mBooks.toFixed(1) + ' kg</b><span>of books</span></div><div><b>' + (Math.LN2 / G.rate).toFixed(2) + ' s</b><span>for a lean to double at the top, in real time</span></div>' +
      (SV.rt ? '<div><b>⚡ Real time</b><span>no slow motion: you have ' + (Math.LN2 / G.rate).toFixed(2) + ' s to catch a lean before it doubles</span></div>' : '<div><b>×' + L.speed.toFixed(2) + '</b><span>slow motion near the top, so it looks like ' + (Math.LN2 / G.rate / L.speed).toFixed(1) + ' s</span></div>') + '</div>' +
      '<p>The books hang from the cart. Swing them up by rolling the cart in time with the swing, then ' + goalText() + '.</p>' +
      '<p class="small">Watch the Swing bar: when it reaches the line, the books have just enough energy to stand up. ' + (SV.rt ? 'Real time is much harder: the books fall at their true speed.' : 'Near the top, time slows down so you can react.') + ' ★★★ under ' + parFor(G.n) + ' s.</p>' + timePick() +
      '<div class="bc-actions"><button type="button" class="go" data-act="go">▶ Start</button><button type="button" data-act="auto">🤖 Watch the autopilot</button><button type="button" data-act="menu">Menu</button></div>', 'intro');
  }
  function fact() { return FACTS[Math.floor(Math.random() * FACTS.length)]; }
  function statsHtml() {
    var N = G.sys.N;
    return '<div class="bc-stats"><div><b>' + G.t.toFixed(1) + ' s</b><span>to swing up and ' + (SV.goal === 'bal' ? 'balance' : 'straighten') + '</span></div><div><b>' + G.tsim.toFixed(2) + ' s</b><span>of simulated time</span></div><div><b>' + Math.round(G.peakF) + ' N</b><span>strongest push</span></div><div><b>' + fmt(G.st[2 * N], 1) + ' J</b><span>net work by the motor</span></div></div>';
  }
  function showClear(st) {
    var par = parFor(G.n), gl = goal();
    showOv('<h2 id="bc-ov-h">' + (SV.goal === 'bal' ? 'Balanced!' : 'Straight as a rod!') + '</h2><p class="bc-stars">' + '★★★'.slice(0, st) + '<span style="opacity:.25">' + '★★★'.slice(st) + '</span></p>' +
      (SV.goal === 'bal' ? '' : '<p class="small">Every book stood within ' + gl.deg + '° of vertical for ' + gl.hold + ' s.</p>') +
      (G.autoUsed ? '<p class="small">That was the autopilot, so it doesn’t count toward your stars.</p>' : '<p class="small">★ ' + (SV.goal === 'bal' ? 'balance it' : 'stand it straight') + ' · ★★ within ' + 2 * par + ' s · ★★★ within ' + par + ' s' + (G.autoSlow ? '' : ' · ⚡ in real time, no slow motion') + '</p>') + statsHtml() + '<p class="bc-fact">💡 ' + fact() + '</p>' +
      '<div class="bc-actions">' + (G.n < 25 ? '<button type="button" class="go" data-act="next">Next: ' + (G.n + 1) + ' books →</button>' : '<button type="button" class="go" data-act="lab">Open the Lab</button>') + '<button type="button" data-act="retry">↻ Again</button><button type="button" data-act="menu">Menu</button></div>');
  }
  function showBlown() {
    showOv('<h2 id="bc-ov-h">The numbers ran away</h2><p>These settings made the simulation unstable (a spring too stiff to follow, or a push too hard). Try a gentler setting.</p><div class="bc-actions"><button type="button" class="go" data-act="retry">↻ Start again</button><button type="button" data-act="menu">Menu</button></div>');
  }
  ov.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.rt !== undefined) {
      SV.rt = b.dataset.rt === '1'; persist(); if (G.mode === 'levels') levelSpeed();
      if (ov.dataset.kind === 'intro') showIntro(); else if (ov.dataset.kind === 'menu') showMenu();
      var nb = ov.querySelector('[data-rt="' + b.dataset.rt + '"]'); if (nb) nb.focus({ preventScroll: true });
      return;
    }
    if (b.dataset.goal) {
      SV.goal = GOALS[b.dataset.goal] ? b.dataset.goal : 'bal'; persist(); G.hold = 0;
      if (ov.dataset.kind === 'intro') showIntro(); else if (ov.dataset.kind === 'menu') showMenu();
      var gb = ov.querySelector('[data-goal="' + SV.goal + '"]'); if (gb) gb.focus({ preventScroll: true });
      return;
    }
    if (b.dataset.lv) { startLevel(+b.dataset.lv); return; }
    if (b.dataset.mode) { if (b.dataset.mode === 'levels') startLevel(Math.min(SV.unlocked, 25)); else { labToForm(); startLab(); } return; }
    var a = b.dataset.act;
    if (a === 'go') go();
    else if (a === 'menu') showMenu();
    else if (a === 'retry') restart();
    else if (a === 'auto') { go(); setAuto(true); }
    else if (a === 'next') startLevel(G.n + 1);
    else if (a === 'lab') { labToForm(); startLab(); }
  });
  function restart() {
    var a = G.auto;
    if (G.mode === 'lab') { startLab(true); return; }
    startLevel(G.n, true); if (a) { setAuto(true); } else setAuto(false);
  }

  // ---------- input ----------
  var strip = $('bc-strip');
  // Sliding moves the cart's target by as much as your finger moves across the picture, starting from wherever the target is.
  var drag = { x: 0 };
  function dragTo(clientX) { var lim = G.sys.xEnd - 0.05, x = G.input.tx + (clientX - drag.x) / G.cam.S; drag.x = clientX; G.input.tx = Math.max(-lim, Math.min(lim, x)); }
  root.addEventListener('pointerdown', function (e) {
    // the dimmed backdrop around the Start card also starts the game, so a slide can begin right away
    if (e.target.closest('.bc-top,.bc-panel,.bc-lab,.bc-card') || (e.target === ov && !ready())) return;
    if (G.auto && G.phase === 'play') setAuto(false);
    G.input.touch = true; drag.x = e.clientX; strip.classList.add('used');
    if (ready()) go();
    try { root.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
  });
  root.addEventListener('pointermove', function (e) { if (G.input.touch) dragTo(e.clientX); });
  function up() { G.input.touch = false; }
  root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up); root.addEventListener('lostpointercapture', up);
  function key(e, down) {
    var k = e.key; if (e.target.closest && e.target.closest('input,select,textarea')) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'ArrowRight' || k === 'd' || k === 'D') {
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') G.input.left = down; else G.input.right = down;
      e.preventDefault(); strip.classList.add('used');
      if (down && G.auto && G.phase === 'play') setAuto(false);
      if (down && ready()) go();
      return;
    }
    if (!down) return;
    if (k === 'p' || k === 'P') togglePause();
    else if (k === 'r' || k === 'R') restart();
    else if (k === 'i' || k === 'I') setPanel($('bc-panel').hidden);
    else if (k === 'o' || k === 'O') toggleAuto();
    else if (k === 'Escape') { if (ov.classList.contains('on') && G.phase === 'play') { hideOv(); setPaused(false); } else showMenu(); }
    else if ((k === 'Enter' || k === ' ') && ready() && !(e.target.closest && e.target.closest('button'))) { go(); e.preventDefault(); }
  }
  D.addEventListener('keydown', function (e) { if (root.isConnected) key(e, true); });
  D.addEventListener('keyup', function (e) { key(e, false); });
  function togglePause() { if (G.phase !== 'play') return; setPaused(!G.paused); }
  function toggleAuto() { if (G.phase === 'done') return; setAuto(!G.auto); }
  $('bc-pause').addEventListener('click', togglePause);
  $('bc-restart').addEventListener('click', function () { restart(); });
  $('bc-auto').addEventListener('click', toggleAuto);
  $('bc-sci').addEventListener('click', function () { setPanel($('bc-panel').hidden); });
  $('bc-menu').addEventListener('click', showMenu);
  W.addEventListener('blur', function () { G.input.left = G.input.right = G.input.touch = false; });

  // ---------- main loop ----------
  var acc = 0, last = performance.now();
  function frame(now) {
    // ask for the next frame first, so nothing that goes wrong below can stop the game (and its buttons) for good
    W.requestAnimationFrame(frame);
    var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    try {
      if (!G.paused && G.phase !== 'menu' && !(G.phase === 'done' && (G.mode === 'levels' || G.blewUp))) {
        var target = G.autoSlow ? slowFor(G.sys.comState(G.st).lean) : G.fixedSpeed;
        if (!isFinite(target)) target = 1; if (!isFinite(G.speed)) G.speed = target;
        G.speed += (target - G.speed) * Math.min(1, dt / 0.3);
        if (!isFinite(acc)) acc = 0;
        acc += dt * G.speed; var n = 0;
        while (acc >= H && n < 90) { tick(H); acc -= H; n++; if (G.phase === 'done' && (G.mode === 'levels' || G.blewUp)) { acc = 0; break; } }
        if (n >= 90) acc = 0;
      }
      render(G.paused ? 0 : dt);
      hudT += dt; if (hudT > 0.1) { hudT = 0; hud(); }
    } catch (err) {
      if (W.console) W.console.error(err);
      for (var i2 = 0; G.st && i2 < G.st.length; i2++) if (!isFinite(G.st[i2])) { blowUp(); break; }
    }
  }

  // first screen: a lab preset from the address (?lab=swing), or the menu
  var q = /[?&]lab=([a-z]+)/.exec(W.location.search);
  if (q && PRESETS[q[1]]) { for (var k in PRESETS[q[1]]) LAB[k] = PRESETS[q[1]][k]; labToForm(); startLab(); }
  else { startLevel(Math.min(SV.unlocked, 25), true); showMenu(); }
  if (W.innerWidth > 900 && G.mode !== 'lab') setPanel(true);
  if (/[?&]bcdebug\b/.test(W.location.search)) W.__bc = { G: G, startLevel: startLevel, preset: preset, LEVELS: LEVELS, setAuto: setAuto, SV: SV };
  W.requestAnimationFrame(frame);
})(window, document);
