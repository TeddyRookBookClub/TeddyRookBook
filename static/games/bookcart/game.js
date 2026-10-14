/* Book Cart: balance a chain of books standing in a rolling shopping cart. The physics is in physics.js (BCPhys). */
(function (W, D) {
  'use strict';
  var P = W.BCPhys, $ = function (id) { return D.getElementById(id); };
  var root = $('bc'); if (!root || !P) return;
  var LESSON = JSON.parse($('bc-lessons').textContent);
  // Level table: computed offline from the stability analysis (see physics.js, System.modes): for each number of books, the
  // binding stiffness that leaves exactly one way to fall, and the clamp that sets how fast that fall grows (doubling time t2).
  var LEVELS = [{"n":2,"seed":1002,"sBind":1.2,"sBase":2.18402,"wind":0,"t2":1.15},{"n":3,"seed":1003,"sBind":1.7858,"sBase":2.61081,"wind":0,"t2":1.124},{"n":4,"seed":1004,"sBind":2.5381,"sBase":2.12043,"wind":2.39,"t2":1.098},{"n":5,"seed":1005,"sBind":3.3211,"sBase":2.1414,"wind":2.59,"t2":1.072},{"n":6,"seed":1006,"sBind":4.0181,"sBase":2.15951,"wind":2.78,"t2":1.046},{"n":7,"seed":1007,"sBind":4.5762,"sBase":2.2205,"wind":2.98,"t2":1.02},{"n":8,"seed":1008,"sBind":4.9551,"sBase":2.50836,"wind":3.17,"t2":0.993},{"n":9,"seed":1009,"sBind":5.4078,"sBase":2.88367,"wind":3.37,"t2":0.967},{"n":10,"seed":1010,"sBind":6.6595,"sBase":2.28591,"wind":3.57,"t2":0.941},{"n":11,"seed":1011,"sBind":7.2134,"sBase":2.10138,"wind":3.76,"t2":0.915},{"n":12,"seed":1012,"sBind":7.892,"sBase":2.04388,"wind":3.96,"t2":0.889},{"n":13,"seed":1013,"sBind":7.3301,"sBase":2.75308,"wind":4.15,"t2":0.863},{"n":14,"seed":1014,"sBind":7.8901,"sBase":2.65748,"wind":4.35,"t2":0.837},{"n":15,"seed":1015,"sBind":8.3817,"sBase":2.43315,"wind":4.54,"t2":0.811},{"n":16,"seed":1016,"sBind":8.9677,"sBase":2.23075,"wind":4.74,"t2":0.785},{"n":17,"seed":1017,"sBind":9.0937,"sBase":2.41578,"wind":4.93,"t2":0.759},{"n":18,"seed":1018,"sBind":8.4807,"sBase":2.86754,"wind":5.13,"t2":0.733},{"n":19,"seed":1019,"sBind":9.275,"sBase":2.34462,"wind":5.33,"t2":0.707},{"n":20,"seed":1020,"sBind":8.8917,"sBase":2.21234,"wind":5.52,"t2":0.68},{"n":21,"seed":1021,"sBind":8.2994,"sBase":2.53537,"wind":5.72,"t2":0.654},{"n":22,"seed":1022,"sBind":8.7474,"sBase":1.75371,"wind":5.91,"t2":0.628},{"n":23,"seed":1023,"sBind":8.5089,"sBase":1.34809,"wind":6.11,"t2":0.602},{"n":24,"seed":1024,"sBind":7.8468,"sBase":1.85222,"wind":6.3,"t2":0.576},{"n":25,"seed":1025,"sBind":8.1018,"sBase":0.58394,"wind":6.5,"t2":0.55}];
  function lv(n) { return LEVELS[Math.max(0, Math.min(23, n - 2))]; }
  var GOAL = 20, H = 1 / 360, ITERS = 2, ZETA = 0.08, CART = 15, PIV = 0.8, FAIL_LEAN = 35 * Math.PI / 180, FAIL_BEND = 0.6;
  var COLORS = ['#63e6be', '#ffa94d', '#f783ac', '#74c0fc', '#b197fc', '#c0eb75', '#ffe8cc', '#ffc078', '#66d9e8', '#faa2c1', '#ffd43b', '#ff8787', '#a9e34b', '#91a7ff', '#e599f7', '#8ce99a'];
  var TOWER_BOOKS = P.makeBooks(25, 4242);
  // Tower: binding and clamp stiffness for 2…25 of the Tower's own books, calibrated the same way as the levels.
  var TOWER = [[1.2,2.16179],[1.7955,2.57502],[2.6413,2.27003],[2.9223,3],[3.4685,2.76296],[4.0893,2.62543],[5.2655,2.15652],[5.5574,2.54628],[6.0937,2.53621],[6.666,2.49532],[7.0416,2.83356],[8.4138,2.03545],[8.6733,2.03612],[8.0911,3],[8.4811,3],[8.6872,2.87885],[9.1319,2.42987],[9.5441,2.00212],[8.5602,3],[8.9235,2.0818],[8.053,3],[8.3366,1.52012],[7.5697,1.52758],[7.779,0.58746]];
  var FACTS = [
    'A tall stack tips more slowly than a short one: the time it takes to fall grows with the square root of its height. That’s why a broom is easier to balance on your hand than a pencil.',
    'An unbalanced lean doesn’t grow at a steady speed; it doubles again and again. On this level it doubles every {t2} seconds if you hold the cart still.',
    'To move the cart right without dropping the books, you first nudge it left so the stack leans right, then follow it. Self-balancing scooters and robots do the same thing, and so does your hand when you walk with a broom balanced on it.',
    'Human reaction time is about 0.2 seconds. Measure yours by catching a dropped ruler: it falls d = ½ g t², so 20 cm means about 0.2 s.',
    'A book turning in the plane of its cover has a moment of inertia I = m(h² + w²)/12 about its middle (h is its height, w its width). The width adds about 40%, so a book is slower to start and stop turning than a thin stick of the same mass.',
    'The motor force is not just mass × acceleration. When the books lean, they pull on the cart, so the force you need changes from moment to moment. Watch “F = (M+m)a would be” in the physics panel.',
    'Wind pushes each book with F = ½ ρ C_d A v². Double the wind speed and the push is four times as strong.',
    'With free hinges, two copies of the stack that start 0.001° apart soon do completely different things. That is chaos. Try the Chaos twin in the Lab.',
    'Energy is never lost in the simulation, only moved: the panel adds kinetic, gravitational and spring energy, subtracts the work you and the wind did, adds what friction and damping turned into heat, and checks that the total stays the same.'
  ];

  // ---------- saved progress ----------
  var KEY = 'trb-bookcart-v1', SV = { unlocked: 2, best: {}, tower: 0 };
  try { var raw = JSON.parse(W.localStorage.getItem(KEY) || 'null'); if (raw) { SV.unlocked = raw.unlocked || 2; SV.best = raw.best || {}; SV.tower = raw.tower || 0; } } catch (e) { }
  function persist() { try { W.localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) { } }

  // ---------- canvas ----------
  var cv = $('bc-cv'), g = cv.getContext('2d'), DPR = 1, CW = 800, CH = 500;
  function resize() { var r = root.getBoundingClientRect(); DPR = Math.min(2, W.devicePixelRatio || 1); CW = Math.max(200, r.width); CH = Math.max(200, r.height); cv.width = Math.round(CW * DPR); cv.height = Math.round(CH * DPR); }
  var G;
  W.addEventListener('resize', resize); resize();

  // ---------- game state ----------
  G = {
    mode: 'levels', n: 2, sys: null, st: null, t: 0, phase: 'menu', paused: false, scale: 1, fallT: 0,
    input: { left: false, right: false, touch: false, tx: 0 }, auto: false, autoUsed: false,
    wind: { v: 0, target: 0, next: 0, max: 0, gusty: true, steady: 0 },
    hist: [], trail: [], twin: null, E0: 0, maxLean: 0, peakF: 0, rate: 0, f1: 0, sample: 0,
    cam: { S: 0, railY: 0, cx: 0 }, drop: null, nextBook: 12, books: null, lab: null, colors: null, streaks: []
  };
  for (var i = 0; i < 46; i++) G.streaks.push({ x: Math.random(), y: Math.random(), l: 0.3 + Math.random() * 0.7 });

  function build(books, sBase, sBind, zeta, grav) {
    var s = new P.System({ books: books, M: CART, sBase: sBase, sBind: sBind, zeta: zeta, g: grav === undefined ? P.G : grav });
    return s;
  }
  function analyse() {
    var md = G.sys.modes(); G.rate = md.rate; G.unstable = md.unstable; G.f1 = md.freqs.length ? md.freqs[0] : 0;
    var s = G.sys, Jp = 0, mh = 0, d = 0; for (var j = 1; j <= s.n; j++) { Jp += s.m[j] * Math.pow(d + s.l[j] / 2, 2) + s.I[j]; mh += s.m[j] * (d + s.l[j] / 2); d += s.l[j]; }
    G.ap = { k: Jp / mh, lam2: md.rate * md.rate };
  }
  function newState(start) {
    var s = G.sys, st = s.newState(), n = s.n, r = Math.random;
    if (start === 'down') { for (var j = 1; j <= n; j++) st[j] = Math.PI + (j === 1 ? 0.03 : 0); }
    else if (start === 'tilt') { for (j = 1; j <= n; j++) st[j] = 20 * Math.PI / 180; }
    else { var tip = (r() < 0.5 ? -1 : 1) * (0.25 + 0.35 * r()) * Math.PI / 180; for (j = 1; j <= n; j++) st[j] = tip * (1 + 0.15 * (j - 1) / Math.max(1, n - 1)); }
    return st;
  }
  function begin(st) {
    G.st = st; G.sys.initAcc(G.st); G.t = 0; G.hist = []; G.trail = []; G.maxLean = 0; G.peakF = 0; G.fallT = 0; G.sample = 0; G.autoUsed = G.auto;
    G.E0 = G.sys.energy(G.st).total; G.wind.v = G.wind.steady; G.wind.target = G.wind.steady; G.wind.next = 2 + Math.random() * 3;
    G.drop = null; G.nextBook = 12; setPaused(false); G.input.tx = st[0]; G.keyHold = 0; G.lowY = 0; if (G.mode === 'lab') { var lp0 = G.sys.points(st, PIV).pts; for (var q = 1; q < lp0.length; q++) G.lowY = Math.min(G.lowY, lp0[q][1]); }
    if (G.twin) { var t2 = Float64Array.from(st); t2[1] += 1e-3 * Math.PI / 180; G.twin = { sys: build(G.sys.books, G.sys.sBase, G.sys.sBind, G.sys.zeta, G.sys.g), st: t2 }; G.twin.sys.initAcc(t2); }
  }
  function colorsFor(n, off) { G.colorOff = off || 0; var c = []; for (var j = 0; j < n; j++) c.push(COLORS[(j + (off || 0)) % COLORS.length]); return c; }

  function startLevel(n) {
    var L = lv(n); G.mode = 'levels'; G.n = n; G.twin = null; G.auto = false; G.scale = 1; $('bc-lab').hidden = true;
    G.books = P.makeBooks(n, L.seed); G.colors = colorsFor(n, n);
    G.sys = build(G.books, L.sBase, L.sBind, ZETA); analyse();
    G.wind.max = L.wind; G.wind.gusty = true; G.wind.steady = 0;
    begin(newState('up')); G.phase = 'ready'; showIntro();
  }
  function startTower() {
    G.mode = 'tower'; G.n = 2; G.twin = null; G.auto = false; G.scale = 1; $('bc-lab').hidden = true; var T = TOWER[0];
    G.books = TOWER_BOOKS.slice(0, 2); G.colors = colorsFor(25, 3);
    G.sys = build(G.books, T[1], T[0], ZETA); analyse(); G.wind.max = 0; G.wind.gusty = true; G.wind.steady = 0;
    begin(newState('up')); G.phase = 'ready'; showIntro();
  }
  // add one more book on top (Tower mode), keeping the motion of everything below
  function addBook() {
    var old = G.sys, st = G.st, n = old.n; if (n >= 25) return;
    var L = lv(n + 1), T = TOWER[n - 1]; G.books = TOWER_BOOKS.slice(0, n + 1);
    var s = build(G.books, T[1], T[0], ZETA), N0 = old.N, N = s.N, ns = s.newState();
    for (var j = 0; j <= n; j++) { ns[j] = st[j]; ns[N + j] = st[N0 + j]; }
    ns[n + 1] = st[n]; ns[N + n + 1] = st[N0 + n];
    ns[2 * N] = st[2 * N0]; ns[2 * N + 1] = st[2 * N0 + 1];
    G.sys = s; G.n = n + 1; G.st = ns; s.initAcc(ns); analyse(); G.E0 = s.energy(ns).total - ns[2 * N] + ns[2 * N + 1]; G.wind.max = L.wind * 0.8;
  }

  // ---------- Lab ----------
  var LAB = { n: 5, base: 2.14, bind: 3.32, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false };
  var lab = { n: $('bl-n'), base: $('bl-base'), bind: $('bl-bind'), z: $('bl-z'), g: $('bl-g'), w: $('bl-w'), gust: $('bl-gust'), start: $('bl-start'), speed: $('bl-speed'), twin: $('bl-twin'), auto: $('bl-auto') };
  function labToForm() {
    lab.n.value = LAB.n; lab.base.value = Math.round(LAB.base * 100); lab.bind.value = Math.round(LAB.bind * 100); lab.z.value = Math.round(LAB.z * 100);
    lab.g.value = String(LAB.g); lab.w.value = Math.round(LAB.w * 10); lab.gust.checked = LAB.gust; lab.start.value = LAB.start; lab.speed.value = String(LAB.speed); lab.twin.checked = LAB.twin; lab.auto.checked = LAB.auto;
    labLabels();
  }
  function labLabels() {
    $('bl-n-o').textContent = LAB.n; $('bl-base-o').textContent = LAB.base.toFixed(2) + '×'; $('bl-bind-o').textContent = LAB.bind.toFixed(2) + '×';
    $('bl-z-o').textContent = LAB.z.toFixed(2); $('bl-w-o').textContent = LAB.w.toFixed(1) + ' m/s';
  }
  function startLab(keepPanel) {
    G.mode = 'lab'; G.n = LAB.n; G.books = P.makeBooks(LAB.n, 500 + LAB.n); G.colors = colorsFor(LAB.n, 1);
    G.sys = build(G.books, LAB.base, LAB.bind, LAB.z, LAB.g); analyse();
    G.wind.steady = LAB.w; G.wind.max = LAB.gust ? Math.abs(LAB.w) + 2 : 0; G.wind.gusty = LAB.gust; G.auto = LAB.auto; G.twin = LAB.twin ? {} : null;
    G.scale = LAB.speed;
    begin(newState(LAB.start)); G.phase = 'play'; hideOv(); $('bc-lab').hidden = false; G.cam.S = 0;
    if (!keepPanel) setPanel(W.innerWidth > 900);
  }
  function labChanged(e) {
    var id = e.target.id, rebuild = false;
    LAB.n = +lab.n.value; LAB.base = lab.base.value / 100; LAB.bind = lab.bind.value / 100; LAB.z = lab.z.value / 100; LAB.g = +lab.g.value;
    LAB.w = lab.w.value / 10; LAB.gust = lab.gust.checked; LAB.start = lab.start.value; LAB.speed = +lab.speed.value; LAB.twin = lab.twin.checked; LAB.auto = lab.auto.checked;
    labLabels();
    if (id === 'bl-n' || id === 'bl-start' || id === 'bl-twin') { startLab(true); return; }
    if (id === 'bl-base' || id === 'bl-bind' || id === 'bl-z') { G.sys.setStiffness(LAB.base, LAB.bind, LAB.z); if (G.twin && G.twin.sys) G.twin.sys.setStiffness(LAB.base, LAB.bind, LAB.z); analyse(); G.E0 = G.sys.energy(G.st).total - G.st[2 * G.sys.N] + G.st[2 * G.sys.N + 1]; }
    if (id === 'bl-g') { G.sys.g = LAB.g; if (G.twin && G.twin.sys) G.twin.sys.g = LAB.g; analyse(); G.E0 = G.sys.energy(G.st).total - G.st[2 * G.sys.N] + G.st[2 * G.sys.N + 1]; }
    G.wind.steady = LAB.w; G.wind.max = LAB.gust ? Math.abs(LAB.w) + 2 : 0; G.wind.gusty = LAB.gust; if (!LAB.gust) G.wind.target = LAB.w;
    G.scale = LAB.speed; G.auto = LAB.auto;
  }
  ['n', 'base', 'bind', 'z', 'w'].forEach(function (k) { lab[k].addEventListener('input', labChanged); });
  ['g', 'gust', 'start', 'speed', 'twin', 'auto'].forEach(function (k) { lab[k].addEventListener('change', labChanged); });
  var PRESETS = {
    chaos: { n: 3, base: 0, bind: 0, z: 0, g: P.G, w: 0, gust: false, start: 'tilt', speed: 1, twin: true, auto: false },
    broom: { n: 6, base: 0, bind: 20, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    pencil: { n: 1, base: 0, bind: 0, z: 0.08, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    hang: { n: 3, base: 0, bind: 0, z: 0, g: P.G, w: 0, gust: false, start: 'down', speed: 1, twin: false, auto: false },
    free: { n: 10, base: 0, bind: 0, z: 0.02, g: P.G, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    moon: { n: 6, base: 0, bind: 20, z: 0.08, g: 1.62, w: 0, gust: false, start: 'up', speed: 1, twin: false, auto: false },
    wind: { n: 15, base: 2.43, bind: 8.38, z: 0.08, g: P.G, w: 7, gust: true, start: 'up', speed: 1, twin: false, auto: true }
  };
  function preset(k) { var p = PRESETS[k]; if (!p) return; for (var key in p) LAB[key] = p[key]; labToForm(); startLab(true); }
  $('bl-fold').addEventListener('click', function () { var l = $('bc-lab'), f = l.classList.toggle('fold'); this.setAttribute('aria-expanded', f ? 'false' : 'true'); this.setAttribute('aria-label', f ? 'Show the Lab settings' : 'Hide the Lab settings'); });
  D.querySelectorAll('[data-preset]').forEach(function (b) { b.addEventListener('click', function () { preset(b.dataset.preset); }); });

  // ---------- control ----------
  G.Fpush = 0;
  function control(q) {
    var s = G.sys, N = s.N;
    if (G.phase !== 'play') return { F: 0 };
    if (G.auto) return { a: autopilot(q) };
    // the motor drives the cart toward the target you set, like a stiff spring with a shock absorber (ω = 10 rad/s, ζ = 0.9)
    var wc = 10; return { a: wc * wc * (G.input.tx - q[0]) - 2 * 0.9 * wc * q[N] };
  }
  // A simple feedback controller: treat the stack as one leaning body and steer the cart under its centre of mass.
  function autopilot(q) {
    var s = G.sys, N = s.N, c = s.comState(q), w = 3.0, p1 = w * w, p2 = 2 * 0.8 * w;
    var ref = Math.max(-0.08, Math.min(0.08, -0.04 * q[0] - 0.08 * q[N]));
    return G.ap.k * ((G.ap.lam2 + p1) * (c.lean - ref) + p2 * c.leanRate);
  }

  function bend(d) { return Math.abs(Math.atan2(Math.sin(d), Math.cos(d))); }
  function setPaused(v) { G.paused = v; var b = $('bc-pause'); b.textContent = v ? '▶' : '❚❚'; b.setAttribute('aria-label', v ? 'Resume' : 'Pause'); }

  // ---------- simulation ----------
  function updateWind(h) {
    var w = G.wind;
    if (w.max > 0 && w.gusty) {
      w.next -= h;
      if (w.next <= 0) { w.next = 3 + Math.random() * 4; var calm = Math.random() < 0.25; w.target = calm ? w.steady : w.steady + (Math.random() * 2 - 1) * w.max; }
      w.v += (w.target - w.v) * Math.min(1, h * 0.9);
    } else { w.v += (w.steady - w.v) * Math.min(1, h * 2); }
    G.sys.wind = G.sys.windForce(w.v); if (G.twin && G.twin.sys) G.twin.sys.wind = G.sys.wind;
  }
  function tick(h) {
    var s = G.sys, N = s.N, u = (G.input.right ? 1 : 0) - (G.input.left ? 1 : 0);
    if (u && G.phase === 'play' && !G.auto) { G.keyHold += h; var lim = s.xEnd - 0.05; G.input.tx = Math.max(-lim, Math.min(lim, G.input.tx + u * G.ap.k * (0.4 + 1.1 * Math.min(1, G.keyHold)) * h)); } else G.keyHold = 0;
    updateWind(h);
    s.stepNM(G.st, h, control, ITERS);
    if (G.twin && G.twin.sys) { var F = s.lastF; G.twin.sys.stepNM(G.twin.st, h, function () { return { F: F }; }, ITERS); }
    G.t += h;
    if (!isFinite(G.st[0]) || !isFinite(G.st[1])) { G.blewUp = true; G.phase = 'done'; showFail(); return; }
    var cm = s.comState(G.st), lean = Math.abs(cm.lean);
    if (G.phase === 'play') { G.maxLean = Math.max(G.maxLean, lean); G.peakF = Math.max(G.peakF, Math.abs(s.lastF)); }
    if (G.mode === 'lab') { var lp2 = s.points(G.st, PIV).pts; for (var q = 1; q < lp2.length; q++) if (lp2[q][1] < G.lowY) G.lowY = lp2[q][1]; }
    G.sample += h;
    if (G.sample >= 1 / 30) { G.sample = 0; G.hist.push([G.t, cm.lean]); while (G.hist.length && G.hist[0][0] < G.t - 10) G.hist.shift(); var pp = s.points(G.st, PIV).pts; G.trail.push(pp[pp.length - 1]); if (G.trail.length > 50) G.trail.shift(); }
    if (G.phase === 'play' && G.mode !== 'lab') {
      var bent = false; for (var j = 2; j <= s.n; j++) if (bend(G.st[j] - G.st[j - 1]) > FAIL_BEND) bent = true;
      if (lean > FAIL_LEAN || bent) { fail(); return; }
      if (G.mode === 'levels' && G.t >= GOAL) { clear(); return; }
      if (G.mode === 'tower') {
        G.nextBook -= h;
        if (G.nextBook <= 0.7 && !G.drop && G.n < 25) G.drop = { t: 0 };
        if (G.drop) { G.drop.t += h; if (G.drop.t >= 0.7) { G.drop = null; addBook(); G.nextBook = 12; } }
      }
    }
    if (G.phase === 'falling') { G.fallT += h; if (G.fallT > 1.6) { G.phase = 'done'; showFail(); } }
  }
  function fail() { if (G.phase !== 'play') return; G.phase = 'falling'; G.fallT = 0; }
  function stars() { return G.maxLean < 7 * Math.PI / 180 ? 3 : G.maxLean < 15 * Math.PI / 180 ? 2 : 1; }
  function clear() {
    G.phase = 'done'; var n = G.n, st = stars();
    if (!G.autoUsed) { var b = SV.best[n] || { s: 0 }; if (st > b.s) SV.best[n] = { s: st }; if (n + 1 > SV.unlocked && n < 25) SV.unlocked = n + 1; persist(); }
    showClear(st);
  }

  // ---------- drawing ----------
  function cam() {
    var s = G.sys, strip = 64, top = 74, xr = s.xEnd + 0.45, lab = G.mode === 'lab';
    // on a narrow screen the panels lie across the picture, so fit the scene between them
    if (CW <= 900) {
      var lp = $('bc-lab'), pp = $('bc-panel');
      if (!lp.hidden) top = Math.max(top, lp.offsetTop + lp.offsetHeight + 8);
      if (!pp.hidden) strip = Math.max(strip, CH - pp.offsetTop + 8);
      if (CH - strip - top < 140) { top = 74; strip = 64; }
    }
    var up = PIV + s.height + 0.25, railY, S;
    // The scale fits the stack's height. If the whole rail doesn't fit across (a phone held upright), the camera follows the cart instead.
    var fitW = (CW - 24) / (2 * xr), fitH;
    if (lab) { var down = Math.max(0.25, 0.25 - G.lowY); fitH = (CH - strip - top) / (up + down); S = Math.min(fitH, Math.max(fitW, fitH * 0.7)); railY = top + up * S; }
    else { railY = CH - strip - 26; fitH = (railY - top) / up; S = Math.min(fitH, Math.max(fitW, fitH * 0.7)); }
    var c = G.cam; c.S = c.S ? c.S + (S - c.S) * 0.08 : S; c.railY = c.railY ? c.railY + (railY - c.railY) * 0.1 : railY;
    var hw = (CW / 2 - 12) / c.S, x = G.st[0], want = 0;
    if (hw < xr) { want = Math.max(x - hw * 0.4, Math.min(x + hw * 0.4, c.cx)); want = Math.max(-xr + hw, Math.min(xr - hw, want)); }
    c.cx += (want - c.cx) * 0.12;
  }
  function X(x) { return CW / 2 + (x - G.cam.cx) * G.cam.S; }
  function Y(y) { return G.cam.railY - y * G.cam.S; }
  function drawBackground() {
    var grd = g.createLinearGradient(0, 0, 0, CH); grd.addColorStop(0, '#081723'); grd.addColorStop(1, '#040b12'); g.fillStyle = grd; g.fillRect(0, 0, CW, CH);
    var S = G.cam.S, step = S > 160 ? 0.1 : S > 60 ? 0.25 : 0.5;
    g.lineWidth = 1;
    var x0 = Math.floor((G.cam.cx - CW / 2 / S) / step) * step, y0 = Math.floor(-(CH - G.cam.railY) / S / step) * step;
    for (var x = x0; X(x) < CW; x += step) { var major = Math.abs(x / 1 - Math.round(x)) < 1e-6; g.strokeStyle = major ? 'rgba(120,170,200,0.13)' : 'rgba(120,170,200,0.05)'; g.beginPath(); g.moveTo(Math.round(X(x)) + 0.5, 0); g.lineTo(Math.round(X(x)) + 0.5, CH); g.stroke(); }
    for (var y = y0; Y(y) > 0; y += step) { var mj = Math.abs(y - Math.round(y)) < 1e-6; g.strokeStyle = mj ? 'rgba(120,170,200,0.13)' : 'rgba(120,170,200,0.05)'; g.beginPath(); g.moveTo(0, Math.round(Y(y)) + 0.5); g.lineTo(CW, Math.round(Y(y)) + 0.5); g.stroke(); }
  }
  function drawRail() {
    var s = G.sys, y = Y(0);
    g.strokeStyle = 'rgba(160,200,220,0.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(X(-s.xEnd - 0.4), y); g.lineTo(X(s.xEnd + 0.4), y); g.stroke();
    g.fillStyle = 'rgba(160,200,220,0.6)'; g.font = '11px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top';
    for (var m = Math.ceil(-s.xEnd); m <= s.xEnd; m++) { g.fillRect(X(m) - 0.5, y - 5, 1, 10); g.fillText((m > 0 ? '+' : '') + m + ' m', X(m), y + 8); }
    [-1, 1].forEach(function (sg) { var bx = X(sg * (s.xEnd + 0.5)); g.fillStyle = '#c2523c'; g.fillRect(bx - 4, y - 26, 8, 26); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(bx - 4, y - 26, 8, 4); });
  }
  function drawCart(x, ghost) {
    var S = G.cam.S, cx = X(x), sc = function (v) { return v * S; }, base = Y(0);
    g.save(); g.translate(cx, 0); if (ghost) g.globalAlpha = 0.25;
    var r = 0.075, wy = base - sc(r), wl = sc(0.32), rot = x / r;
    // frame and wheels
    g.strokeStyle = '#8fb7c9'; g.lineWidth = Math.max(1.5, sc(0.018));
    g.beginPath(); g.moveTo(-sc(0.42), base - sc(0.17)); g.lineTo(sc(0.4), base - sc(0.17)); g.stroke();
    [-wl, wl].forEach(function (wx) {
      g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx * 0.9, base - sc(0.17)); g.stroke();
      g.fillStyle = '#1b2b36'; g.beginPath(); g.arc(wx, wy, sc(r), 0, 7); g.fill(); g.strokeStyle = '#9cc3d4'; g.stroke();
      g.strokeStyle = 'rgba(200,225,235,0.6)'; g.lineWidth = 1; g.beginPath(); for (var k = 0; k < 3; k++) { var a = rot + k * Math.PI / 3; g.moveTo(wx - Math.cos(a) * sc(r) * 0.8, wy - Math.sin(a) * sc(r) * 0.8); g.lineTo(wx + Math.cos(a) * sc(r) * 0.8, wy + Math.sin(a) * sc(r) * 0.8); } g.stroke();
      g.strokeStyle = '#8fb7c9'; g.lineWidth = Math.max(1.5, sc(0.018));
    });
    // basket: a wire trapezoid, wider at the top
    var bt = base - sc(0.95), bb = base - sc(0.3), tl = -sc(0.5), tr = sc(0.48), bl = -sc(0.4), br = sc(0.36);
    g.fillStyle = 'rgba(120,180,200,0.10)'; g.beginPath(); g.moveTo(tl, bt); g.lineTo(tr, bt); g.lineTo(br, bb); g.lineTo(bl, bb); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(170,215,230,0.55)'; g.lineWidth = 1;
    for (var f = 0.06; f < 1; f += 0.07) { g.beginPath(); g.moveTo(tl + (tr - tl) * f, bt); g.lineTo(bl + (br - bl) * f, bb); g.stroke(); }
    [0.33, 0.66].forEach(function (f) { g.beginPath(); g.moveTo(tl + (bl - tl) * f, bt + (bb - bt) * f); g.lineTo(tr + (br - tr) * f, bt + (bb - bt) * f); g.stroke(); });
    g.strokeStyle = '#a9d3e3'; g.lineWidth = Math.max(1.5, sc(0.02)); g.beginPath(); g.moveTo(tl, bt); g.lineTo(tr, bt); g.lineTo(br, bb); g.lineTo(bl, bb); g.closePath(); g.stroke();
    // handle
    g.beginPath(); g.moveTo(tl, bt); g.lineTo(tl - sc(0.16), bt - sc(0.12)); g.stroke();
    g.strokeStyle = '#e8735a'; g.lineWidth = Math.max(3, sc(0.04)); g.lineCap = 'round'; g.beginPath(); g.moveTo(tl - sc(0.16), bt - sc(0.12)); g.lineTo(tl - sc(0.19), bt - sc(0.14)); g.stroke(); g.lineCap = 'butt';
    // the springy clamp holding the bottom book: a post from the basket floor, a pivot pin and a coil spring
    g.fillStyle = '#4d6573'; g.fillRect(-sc(0.02), base - sc(PIV - 0.02), sc(0.04), sc(PIV - 0.32));
    g.fillRect(-sc(0.09), base - sc(0.34), sc(0.18), sc(0.03));
    g.strokeStyle = '#ffd479'; g.lineWidth = Math.max(1.2, sc(0.008)); g.beginPath();
    for (var q = 0; q <= 40; q++) { var aa = q / 40 * Math.PI * 5, rr = sc(0.012 + 0.03 * q / 40); g[q ? 'lineTo' : 'moveTo'](Math.cos(aa) * rr, base - sc(PIV) + Math.sin(aa) * rr); } g.stroke();
    g.restore();
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
  function drawStack(sys, st, ghost) {
    var pp = sys.points(st, PIV), pts = pp.pts, n = sys.n, fallTint = G.phase === 'falling' || (G.phase === 'done' && G.lastResult === 'fail');
    for (var j = 1; j <= n; j++) bookRect(pts[j - 1], pts[j], sys.books[j - 1], ghost ? '#dfe9f0' : (fallTint ? mix(G.colors[j - 1], '#ff6b6b', 0.25) : G.colors[j - 1]), ghost ? 0.28 : 1, j + G.colorOff);
    if (ghost) return pp;
    var jr = Math.max(2.5, Math.min(5, G.cam.S * 0.012));
    for (j = 0; j < n; j++) { var px = X(pts[j][0]), py = Y(pts[j][1]); g.fillStyle = '#0b1220'; g.beginPath(); g.arc(px, py, jr, 0, 7); g.fill(); g.strokeStyle = '#d5e6ef'; g.lineWidth = 1.2; g.stroke(); }
    var tp = pts[n]; g.fillStyle = '#f9a8d4'; g.shadowColor = '#f9a8d4'; g.shadowBlur = 10; g.beginPath(); g.arc(X(tp[0]), Y(tp[1]), jr + 1, 0, 7); g.fill(); g.shadowBlur = 0;
    return pp;
  }
  function mix(a, b, t) { var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); var r = Math.round((pa >> 16) * (1 - t) + (pb >> 16) * t), gg = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t), bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t); return 'rgb(' + r + ',' + gg + ',' + bl + ')'; }
  function drawCom(pp) {
    var c = pp.com, px = X(c[0]), py = Y(c[1]), pv = pp.pts[0], lean = G.sys.comState(G.st).lean;
    g.setLineDash([4, 5]); g.strokeStyle = 'rgba(255,212,121,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px, Y(0)); g.stroke(); g.setLineDash([]);
    g.strokeStyle = 'rgba(255,212,121,0.7)'; g.beginPath(); g.moveTo(X(pv[0]), Y(pv[1])); g.lineTo(px, py); g.stroke();
    var rr = Math.min(60, Math.hypot(px - X(pv[0]), py - Y(pv[1])) * 0.35);
    g.beginPath(); g.arc(X(pv[0]), Y(pv[1]), rr, -Math.PI / 2, -Math.PI / 2 + lean, lean < 0); g.stroke();
    g.strokeStyle = '#ffd479'; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 7, 0, 7); g.moveTo(px - 11, py); g.lineTo(px + 11, py); g.moveTo(px, py - 11); g.lineTo(px, py + 11); g.stroke();
    g.fillStyle = '#ffd479'; g.font = '600 12px ui-monospace,Menlo,monospace'; g.textAlign = lean >= 0 ? 'left' : 'right'; g.textBaseline = 'middle';
    g.fillText((lean * 180 / Math.PI).toFixed(1) + '°', px + (lean >= 0 ? 14 : -14), py);
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
      p.x += v * dt * G.cam.S / CW * 1.5; if (p.x > 1.05) p.x -= 1.1; if (p.x < -0.05) p.x += 1.1;
      var x = p.x * CW, y = 80 + p.y * (G.cam.railY - 90), L = p.l * Math.min(60, Math.abs(v) * 8) * (v > 0 ? 1 : -1);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - L, y); g.stroke();
    });
  }
  function drawTrail() {
    if (G.trail.length < 2) return; g.lineWidth = 2;
    for (var i = 1; i < G.trail.length; i++) { var a = i / G.trail.length; g.strokeStyle = 'rgba(249,168,212,' + (a * 0.5) + ')'; g.beginPath(); g.moveTo(X(G.trail[i - 1][0]), Y(G.trail[i - 1][1])); g.lineTo(X(G.trail[i][0]), Y(G.trail[i][1])); g.stroke(); }
  }
  function drawTarget() {
    if (!G.input.touch || G.phase !== 'play' || G.auto) return;
    var x = X(G.input.tx), y = Y(0); g.setLineDash([3, 4]); g.strokeStyle = 'rgba(99,230,190,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - G.cam.S * 1.1); g.lineTo(x, CH - 10); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#63e6be'; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x - 7, y + 16); g.lineTo(x + 7, y + 16); g.closePath(); g.fill();
  }
  function drawDrop() {
    if (!G.drop) return; var s = G.sys, pp = s.points(G.st, PIV).pts, top = pp[pp.length - 1], bk = TOWER_BOOKS[s.n], k = G.drop.t / 0.7;
    var yTop = top[1] + (1 - k * k) * 2.5 + bk.l, p0 = [top[0], yTop - bk.l], p1 = [top[0], yTop];
    bookRect(p0, p1, bk, G.colors[s.n], 0.95, s.n + 1 + G.colorOff);
  }
  var lastFrame = 0;
  function render(dt) {
    cam(); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawBackground(); drawWind(dt); drawRail();
    if (G.twin && G.twin.sys) { drawCart(G.twin.st[0], true); drawStack(G.twin.sys, G.twin.st, true); }
    drawCart(G.st[0]); drawTrail();
    var pp = drawStack(G.sys, G.st, false); drawCom(pp); drawForce(); drawTarget(); drawDrop();
    if (G.auto && G.phase === 'play') { g.fillStyle = 'rgba(255,212,121,0.9)'; g.font = '600 12px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillText('AUTOPILOT', X(G.st[0]), Y(0) + 26); }
  }

  // ---------- HUD and physics panel ----------
  var vals = $('bc-vals'), energy = $('bc-energy'), chart = $('bc-chart'), cg = chart.getContext('2d'), hudT = 0;
  function fmt(v, d) { return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d === undefined ? 2 : d); }
  function row(label, value, formula) { return '<dt>' + label + (formula ? '<span class="f">' + formula + '</span>' : '') + '</dt><dd>' + value + '</dd>'; }
  function hud() {
    var s = G.sys, st = G.st, N = s.N, title = G.mode === 'lab' ? 'Lab · ' + s.n + (s.n === 1 ? ' book' : ' books') : s.n + ' books';
    $('bc-mode').textContent = G.mode === 'levels' ? 'Level ' + (G.n - 1) + ' of 24' : G.mode === 'tower' ? 'Tower' : 'Lab';
    $('bc-title').textContent = title;
    $('bc-time').textContent = G.t.toFixed(1) + ' s' + (G.mode === 'levels' ? ' / ' + GOAL + ' s' : '');
    $('bc-prog').style.width = (G.mode === 'levels' ? Math.min(100, G.t / GOAL * 100) : G.mode === 'tower' ? Math.min(100, (12 - G.nextBook) / 12 * 100) : 0) + '%';
    if ($('bc-panel').hidden) return;
    var cm = s.comState(st), F = s.lastF || 0, a = s.lastAcc || 0, E = s.energy(st), W = st[2 * N], Ls = st[2 * N + 1];
    var maxBend = 0; for (var j = 2; j <= s.n; j++) maxBend = Math.max(maxBend, bend(st[j] - st[j - 1]));
    var html = '<dt class="sec">Cart</dt>' + row('Position x', fmt(st[0]) + ' m') + row('Speed v', fmt(st[N]) + ' m/s') + row('Acceleration a', fmt(a, 1) + ' m/s²') +
      row('Motor force F', fmt(F, 0) + ' N') + row('F = (M+m)a would be', fmt(s.mTot * a, 0) + ' N', 'the gap is the books pulling on the cart') +
      '<dt class="sec">Books</dt>' + row('Mass m', s.mBooks.toFixed(1) + ' kg') + row('Height', s.height.toFixed(2) + ' m') + row('Centre of mass', cm.y.toFixed(2) + ' m up') +
      row('Lean φ', fmt(cm.lean * 180 / Math.PI, 1) + '°') + row('Lean rate', fmt(cm.leanRate * 180 / Math.PI, 0) + '°/s') +
      row('Gravity torque', fmt(s.mBooks * s.g * cm.x, 1) + ' N·m', 'τ = m g × sideways offset') + row('Sharpest bend', (maxBend * 180 / Math.PI).toFixed(1) + '°') +
      '<dt class="sec">Stability</dt>' + row('Doubling time', G.rate > 0.01 ? (Math.LN2 / G.rate).toFixed(2) + ' s' : 'stable', 't₂ = ln 2 / λ, for the stack standing straight up with the cart held still') + row('Slowest wobble', G.f1 ? G.f1.toFixed(2) + ' Hz' : '—') +
      row('Gravity g', s.g.toFixed(2) + ' m/s²') +
      '<dt class="sec">Air</dt>' + row('Wind', fmt(G.wind.v, 1) + ' m/s') + row('Push per book', fmt(s.wind || 0, 2) + ' N', 'F = ½ ρ C_d A v²');
    vals.innerHTML = html;
    var pg = E.pg, mx = Math.max(1, E.ke, pg, E.ps, Math.abs(W), Ls);
    function bar(label, v, col) { return '<div class="row"><span>' + label + '</span><span class="bar"><i style="width:' + Math.min(100, Math.abs(v) / mx * 100) + '%;background:' + col + '"></i></span><span class="num">' + fmt(v, 1) + ' J</span></div>'; }
    var resid = E.total - G.E0 - W + Ls;
    energy.innerHTML = '<b style="font-size:.75rem;color:#63e6be;text-transform:uppercase;letter-spacing:.06em">Energy</b>' + bar('Kinetic', E.ke, '#74c0fc') + bar('Gravitational', pg, '#ffd479') + bar('Springs', E.ps, '#b197fc') +
      bar('Work in (you, wind)', W, '#63e6be') + bar('Lost to friction', Ls, '#ff8787') +
      '<div class="chk">Energy check: total − work in + lost = ' + fmt(G.E0, 1) + ' J at the start, now off by ' + Math.abs(resid).toFixed(3) + ' J</div>';
    drawChart();
  }
  function drawChart() {
    var w = chart.clientWidth || 240, h = chart.clientHeight || 70; if (chart.width !== Math.round(w * DPR)) { chart.width = Math.round(w * DPR); chart.height = Math.round(h * DPR); }
    cg.setTransform(DPR, 0, 0, DPR, 0, 0); cg.clearRect(0, 0, w, h);
    var lim = FAIL_LEAN * 1.15, Yc = function (v) { return h / 2 - v / lim * (h / 2 - 4); };
    cg.strokeStyle = 'rgba(255,255,255,0.12)'; cg.beginPath(); cg.moveTo(0, h / 2); cg.lineTo(w, h / 2); cg.stroke();
    cg.strokeStyle = 'rgba(255,107,107,0.55)'; cg.setLineDash([3, 3]); cg.beginPath(); cg.moveTo(0, Yc(FAIL_LEAN)); cg.lineTo(w, Yc(FAIL_LEAN)); cg.moveTo(0, Yc(-FAIL_LEAN)); cg.lineTo(w, Yc(-FAIL_LEAN)); cg.stroke(); cg.setLineDash([]);
    if (G.hist.length < 2) return; var t1 = G.t, t0 = t1 - 10;
    cg.strokeStyle = '#ffd479'; cg.lineWidth = 1.6; cg.beginPath();
    G.hist.forEach(function (p, i) { var x = (p[0] - t0) / 10 * w, y = Yc(Math.max(-lim, Math.min(lim, p[1]))); if (i) cg.lineTo(x, y); else cg.moveTo(x, y); }); cg.stroke();
  }
  function setPanel(on) { $('bc-panel').hidden = !on; $('bc-sci').setAttribute('aria-pressed', on ? 'true' : 'false'); }

  // ---------- overlays ----------
  var ov = $('bc-ov');
  function showOv(html, kind) { ov.dataset.kind = kind || ''; ov.innerHTML = '<div class="bc-card">' + html + '</div>'; ov.classList.add('on'); var f = ov.querySelector('.go,button'); if (f) f.focus({ preventScroll: true }); }
  // ready to start: the level's Start card is showing (or nothing is), not the menu
  function ready() { return G.phase === 'ready' && (!ov.classList.contains('on') || ov.dataset.kind === 'intro'); }
  function hideOv() { ov.classList.remove('on'); }
  function levelGrid() {
    var h = '<div class="bc-levels">';
    for (var n = 2; n <= 25; n++) { var b = SV.best[n], st = b ? '★★★'.slice(0, b.s) : ''; h += '<button type="button" data-lv="' + n + '"' + (n > SV.unlocked ? ' disabled' : '') + (n === G.n && G.mode === 'levels' ? ' class="cur"' : '') + '>' + n + '<small>' + st + '</small></button>'; }
    return h + '</div>';
  }
  function showMenu() {
    G.phase = G.phase === 'play' ? 'play' : G.phase; G.paused = true;
    showOv('<h2 id="bc-ov-h">🛒 Book Cart</h2><p>Books are linked end to end and stand in a shopping cart. Roll the cart under them to keep the tower from toppling. Every book obeys real physics: gravity, inertia, springy bindings, friction and wind.</p>' +
      '<div class="bc-modes"><button type="button" data-mode="levels" class="on"><b>Levels</b><small>2 to 25 books. Keep them up for ' + GOAL + ' seconds to unlock the next.</small></button>' +
      '<button type="button" data-mode="tower"><b>Tower</b><small>Start with 2. A new book lands on top every 12 s. How tall can you go?' + (SV.tower ? ' Best: ' + SV.tower + ' books.' : '') + '</small></button>' +
      '<button type="button" data-mode="lab"><b>Lab</b><small>Change gravity, stiffness, wind and more. Watch chaos, or let the autopilot try.</small></button></div>' +
      '<h3>Pick a level <span class="small">(number of books)</span></h3>' + levelGrid() +
      '<p class="small">Phone or mouse: press anywhere on the game and slide left or right; the cart moves with you. Keyboard: hold ← → to slide the cart. 🔬 shows the live physics. <a href="' + LESSON + '">Learn the physics →</a></p>');
  }
  function showIntro() {
    var s = G.sys, L = lv(G.n), tower = G.mode === 'tower';
    G.paused = false;
    showOv('<h2 id="bc-ov-h">' + (tower ? 'Tower' : 'Level ' + (G.n - 1) + ': ' + G.n + ' books') + '</h2>' +
      '<div class="bc-stats"><div><b>' + s.height.toFixed(2) + ' m</b><span>tall</span></div><div><b>' + s.mBooks.toFixed(1) + ' kg</b><span>of books</span></div><div><b>' + (Math.LN2 / G.rate).toFixed(2) + ' s</b><span>doubling time of a lean</span></div><div><b>' + (tower ? 'grows' : (L.wind ? 'up to ' + L.wind.toFixed(1) + ' m/s' : 'calm')) + '</b><span>' + (tower ? 'a book every 12 s' : 'gusts of wind') + '</span></div></div>' +
      '<p>' + (tower ? 'Keep the tower up while new books land on top. The taller it gets, the slower it tips, but the more it wobbles.' : 'Keep the books from toppling for ' + GOAL + ' seconds. A lean past 35° and they’re gone.') + '</p>' +
      '<p class="small">Slide left or right, or hold ← →. The cart follows. Small, early moves beat big late ones.</p>' +
      '<div class="bc-actions"><button type="button" class="go" data-act="go">▶ Start</button><button type="button" data-act="menu">Menu</button></div>', 'intro');
  }
  function fact() { var f = FACTS[Math.floor(Math.random() * FACTS.length)]; return f.replace('{t2}', (Math.LN2 / (G.rate || 1)).toFixed(2)); }
  function statsHtml() {
    var N = G.sys.N;
    return '<div class="bc-stats"><div><b>' + G.t.toFixed(1) + ' s</b><span>balanced</span></div><div><b>' + (G.maxLean * 180 / Math.PI).toFixed(1) + '°</b><span>biggest lean</span></div><div><b>' + Math.round(G.peakF) + ' N</b><span>strongest push</span></div><div><b>' + fmt(G.st[2 * N], 1) + ' J</b><span>work done by you and the wind</span></div></div>';
  }
  function showFail() {
    G.lastResult = 'fail'; var blew = G.blewUp; G.blewUp = false;
    var tower = G.mode === 'tower', extra = '';
    if (tower) { if (G.n > SV.tower) { SV.tower = G.n; persist(); extra = '<p><b>New best: ' + G.n + ' books!</b></p>'; } else extra = '<p>You reached ' + G.n + ' books. Best: ' + SV.tower + '.</p>'; }
    if (blew) { showOv('<h2 id="bc-ov-h">The numbers ran away</h2><p>These settings made the simulation unstable (a spring too stiff to follow, or a push too hard). Try a gentler setting.</p><div class="bc-actions"><button type="button" class="go" data-act="retry">↻ Start again</button><button type="button" data-act="menu">Menu</button></div>'); return; }
    showOv('<h2 id="bc-ov-h">' + (tower ? 'The tower fell' : 'The books toppled') + '</h2>' + extra + statsHtml() + '<p class="bc-fact">💡 ' + fact() + '</p>' +
      '<div class="bc-actions"><button type="button" class="go" data-act="retry">↻ Try again</button>' + (tower ? '' : '<button type="button" data-act="auto">Let the autopilot try</button>') + '<button type="button" data-act="menu">Menu</button><button type="button" data-act="lab">Open the Lab</button></div>');
  }
  function showClear(st) {
    G.lastResult = 'clear';
    showOv('<h2 id="bc-ov-h">Balanced!</h2><p class="bc-stars">' + '★★★'.slice(0, st) + '<span style="opacity:.25">' + '★★★'.slice(st) + '</span></p>' +
      (G.autoUsed ? '<p class="small">That was the autopilot, so it doesn’t count toward your stars.</p>' : '<p class="small">★ stay up · ★★ never lean past 15° · ★★★ never past 7°</p>') + statsHtml() + '<p class="bc-fact">💡 ' + fact() + '</p>' +
      '<div class="bc-actions">' + (G.n < 25 ? '<button type="button" class="go" data-act="next">Next: ' + (G.n + 1) + ' books →</button>' : '<button type="button" class="go" data-act="tower">Try the Tower</button>') + '<button type="button" data-act="retry">↻ Again</button><button type="button" data-act="menu">Menu</button></div>');
  }
  ov.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.lv) { startLevel(+b.dataset.lv); return; }
    if (b.dataset.mode) { if (b.dataset.mode === 'levels') startLevel(Math.min(SV.unlocked, 25)); else if (b.dataset.mode === 'tower') { $('bc-lab').hidden = true; startTower(); } else { labToForm(); startLab(); } return; }
    var a = b.dataset.act;
    if (a === 'go') { hideOv(); G.phase = 'play'; G.paused = false; }
    else if (a === 'menu') showMenu();
    else if (a === 'retry') { G.auto = false; restart(); }
    else if (a === 'auto') { G.auto = true; restart(true); }
    else if (a === 'next') startLevel(G.n + 1);
    else if (a === 'tower') startTower();
    else if (a === 'lab') { labToForm(); startLab(); }
  });
  function restart(keepAuto) {
    if (G.mode === 'lab') { startLab(true); return; }
    if (G.mode === 'tower') { startTower(); return; }
    var a = keepAuto ? G.auto : false; startLevel(G.n); G.auto = a; if (a) { hideOv(); G.phase = 'play'; G.autoUsed = true; }
  }

  // ---------- input ----------
  var strip = $('bc-strip');
  // Sliding moves the cart's target. It's geared to the stack: moving the cart a distance d tips the books back by about d / k
  // (k = the stack's pendulum length), so each pixel of sliding is worth the same small lean, about 0.12°, whatever the height.
  var drag = { x: 0 }, PX = 0.0021;
  function dragTo(clientX) { var lim = G.sys.xEnd - 0.05, x = G.input.tx + (clientX - drag.x) * G.ap.k * PX; drag.x = clientX; G.input.tx = Math.max(-lim, Math.min(lim, x)); }
  root.addEventListener('pointerdown', function (e) {
    // the dimmed backdrop around the Start card also starts the game, so a slide can begin right away
    if (e.target.closest('.bc-top,.bc-panel,.bc-lab,.bc-card') || (e.target === ov && !ready())) return;
    G.input.touch = true; drag.x = e.clientX; strip.classList.add('used');
    if (ready()) { hideOv(); G.phase = 'play'; }
    try { root.setPointerCapture(e.pointerId); } catch (er) { }
    e.preventDefault();
  });
  root.addEventListener('pointermove', function (e) { if (G.input.touch) dragTo(e.clientX); });
  function up() { G.input.touch = false; }
  root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up); root.addEventListener('lostpointercapture', up);
  function key(e, down) {
    var k = e.key; if (e.target.closest && e.target.closest('input,select,textarea')) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { G.input.left = down; e.preventDefault(); strip.classList.add('used'); if (down && ready()) { hideOv(); G.phase = 'play'; } }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { G.input.right = down; e.preventDefault(); strip.classList.add('used'); if (down && ready()) { hideOv(); G.phase = 'play'; } }
    else if (!down) return;
    else if (k === 'p' || k === 'P') togglePause();
    else if (k === 'r' || k === 'R') restart();
    else if (k === 'i' || k === 'I') setPanel($('bc-panel').hidden);
    else if (k === 'Escape') { if (ov.classList.contains('on') && G.phase === 'play') { hideOv(); G.paused = false; } else showMenu(); }
    else if ((k === 'Enter' || k === ' ') && ready() && !(e.target.closest && e.target.closest('button'))) { hideOv(); G.phase = 'play'; e.preventDefault(); }
  }
  D.addEventListener('keydown', function (e) { if (root.isConnected) key(e, true); });
  D.addEventListener('keyup', function (e) { key(e, false); });
  function togglePause() { if (G.phase !== 'play' && G.phase !== 'falling') return; setPaused(!G.paused); }
  $('bc-pause').addEventListener('click', togglePause);
  $('bc-restart').addEventListener('click', function () { restart(); });
  $('bc-sci').addEventListener('click', function () { setPanel($('bc-panel').hidden); });
  $('bc-menu').addEventListener('click', showMenu);
  W.addEventListener('blur', function () { G.input.left = G.input.right = G.input.touch = false; });

  // ---------- main loop ----------
  var acc = 0, last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!G.paused && (G.phase === 'play' || G.phase === 'falling')) {
      var sc = G.scale * (G.phase === 'falling' ? 0.6 : 1); acc += dt * sc; var n = 0;
      while (acc >= H && n < 60) { tick(H); acc -= H; n++; if (G.phase === 'done') { acc = 0; break; } }
      if (n >= 60) acc = 0;
    }
    render(G.paused ? 0 : dt);
    hudT += dt; if (hudT > 0.1) { hudT = 0; hud(); }
    W.requestAnimationFrame(frame);
  }

  // first screen: a lab preset from the address (?lab=chaos), or the menu
  var q = /[?&]lab=([a-z]+)/.exec(W.location.search);
  if (q && PRESETS[q[1]]) { for (var k in PRESETS[q[1]]) LAB[k] = PRESETS[q[1]][k]; labToForm(); startLab(); }
  else { startLevel(Math.min(SV.unlocked, 25)); G.phase = 'ready'; showMenu(); G.paused = false; }
  if (W.innerWidth > 900 && G.mode !== 'lab') setPanel(true);
  if (/[?&]bcdebug\b/.test(W.location.search)) W.__bc = { G: G, startLevel: startLevel, startTower: startTower, preset: preset, LEVELS: LEVELS };
  W.requestAnimationFrame(frame);
})(window, document);
