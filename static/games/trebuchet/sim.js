/* Trebuchet Workshop: the page around physics.js (TrebPhys). Each shot is computed in full when you fire (swing, release,
   flight), then played back on the canvas with a camera that follows the stone. Also runs the controls, charts and missions. */
(function () {
  'use strict';
  var W = window, D = document, L = W.TRBLab, P = W.TrebPhys;
  var root = D.getElementById('trebuchet-lab');
  if (!root || !L || !P) return;
  var RAD = Math.PI / 180, RM = L.reduced;
  var view = D.getElementById('tb-view'), cv = D.getElementById('tb-cv'), K = L.canvas(cv), ctx = K.c;
  var hud = D.getElementById('tb-hud'), eHud = D.getElementById('tb-energy'), eSeg = eHud.querySelectorAll('.tb-ebar i');
  var live = D.getElementById('tb-live'), fireBtn = D.getElementById('tb-fire');
  var chartEl = D.getElementById('tb-chart'), CK = L.canvas(chartEl), chartCap = D.getElementById('tb-chart-cap');
  var readEl = D.getElementById('tb-read'), hintEl = D.getElementById('tb-hint');
  var btnPause = D.getElementById('tb-pause'), btnReset = D.getElementById('tb-reset'), btnSpeed = D.getElementById('tb-speed'), btnField = D.getElementById('tb-field');
  var prefs = L.store('trebuchet-settings');

  // ---------- settings ----------
  var DEF = { scene: 'treb', M: 1500, m: 15, ratio: 4, sling: 5.5, rel: 45, target: 200, hinged: true, drag: true, mb: 150, L3: 1.2, v: 50, ang: 45 };
  var LIM = { M: [100, 3000], m: [1, 60], ratio: [2.5, 6], sling: [3, 8], rel: [0, 90], target: [50, 450], mb: [40, 500], L3: [0.6, 1.8], v: [5, 100], ang: [1, 89] };
  var STEP = { M: 5, m: 1, ratio: 0.1, sling: 0.1, rel: 0.5, target: 1, mb: 5, L3: 0.05, v: 1, ang: 0.5 };
  var STD = { M: 1500, m: 15, ratio: 4, sling: 5.5, rel: 45, hinged: true, mb: 150, L3: 1.2 };
  var PRESETS = {
    standard: {}, fixed: { hinged: false }, light: { mb: 60 }, heavy: { m: 60, M: 3000 }, short: { sling: 3 }
  };
  var PRESET_NOTE = {
    standard: 'The standard machine: a 1,500 kg counterweight and a 15 kg stone.',
    fixed: 'The counterweight is now bolted to the arm. Compare its range with the standard machine.',
    light: 'A 60 kg beam: less energy goes into spinning the beam. Watch the efficiency.',
    heavy: 'A 60 kg stone and a 3,000 kg counterweight: a slow, heavy throw.',
    short: 'A 3 m sling: fire it at 45° and watch where the stone goes. Then try a smaller release angle.'
  };
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  var S = {};
  (function () {
    var sv = prefs.get('s', {}) || {};
    Object.keys(DEF).forEach(function (k) {
      var v = sv[k], d = DEF[k];
      if (typeof d === 'number') S[k] = (typeof v === 'number' && isFinite(v)) ? clamp(v, LIM[k][0], LIM[k][1]) : d;
      else if (typeof d === 'boolean') S[k] = typeof v === 'boolean' ? v : d;
      else S[k] = (v === 'treb' || v === 'range') ? v : d;
    });
  })();
  var saveT = 0;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { prefs.set('s', S); }, 300); }

  // ---------- number formatting ----------
  function num(v, d) {
    if (!isFinite(v)) return '—';
    var s = Math.abs(v).toFixed(d || 0), p = s.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (v < 0 && +s !== 0 ? '−' : '') + p.join('.');
  }
  function deg(v) { return (Math.round(v * 2) / 2 % 1 ? num(v, 1) : num(v, 0)) + '°'; }
  var OUT = {
    M: function (v) { return num(v) + ' kg'; }, m: function (v) { return num(v) + ' kg'; }, ratio: function (v) { return num(v, 1) + ' : 1'; },
    sling: function (v) { return num(v, 1) + ' m'; }, rel: deg, target: function (v) { return num(v) + ' m'; },
    mb: function (v) { return num(v) + ' kg'; }, L3: function (v) { return num(v, 2) + ' m'; }, v: function (v) { return num(v) + ' m/s'; }, ang: deg
  };

  // ---------- state ----------
  var G = {
    phase: 'idle', shot: null, pt: 0, paused: false, spd: 0, field: false, trails: [], marks: [], dust: [], rope: null, ghost: null,
    rec: null, pose: null, poseK: null, landT: 0, flash: 0, shots: [], hingeRec: {}, best: {}, rshot: null, aim: false, aimCam: null,
    sMachine: 30, stone: null, curve: null, bannerT: 0
  };
  var SPEEDS = [{ k: 'auto', label: 'Auto', name: 'auto: slow swing, real-time flight' }, { k: 1, label: '1×', name: 'real time' }, { k: 2, label: '2×', name: 'double speed' }, { k: 0.25, label: '¼×', name: 'quarter speed' }];
  var idleK = null;
  function mopts() { return { M: S.M, m: S.m, ratio: S.ratio, sling: S.sling, rel: S.rel, hinged: S.hinged, drag: S.drag, mb: S.mb, L3: S.L3 }; }
  function relKey(o) { return [o.M, o.m, o.ratio, o.sling, o.hinged, o.drag, o.mb, o.L3].join('|'); }
  function hingeKey(o) { return [o.M, o.m, o.ratio, o.sling, o.rel, o.drag, o.mb, o.L3].join('|'); }
  function rebuildIdle() { idleK = P.machine(mopts()); }
  rebuildIdle();

  // ---------- controls ----------
  var inputs = [].slice.call(root.querySelectorAll('[data-k]')), outs = [].slice.call(root.querySelectorAll('[data-o]'));
  var relSling = D.getElementById('tb-rel-sling'), relStone = D.getElementById('tb-rel-stone');
  function syncInputs() {
    inputs.forEach(function (el) { var k = el.dataset.k; if (el.type === 'checkbox') el.checked = !!S[k]; else if (+el.value !== S[k]) el.value = S[k]; });
    outs.forEach(function (o) { var k = o.dataset.o; o.textContent = OUT[k] ? OUT[k](S[k]) : S[k]; });
    // the little release-angle picture: the arm from its axle (38,37) to its tip (26,9), turning clockwise; the sling trails
    // behind the arm's line by the release angle (counterclockwise on screen, which is a smaller angle when y points down)
    var a = Math.atan2(9 - 37, 26 - 38), b = a - S.rel * RAD, x = 26 + 18 * Math.cos(b), y = 9 + 18 * Math.sin(b);
    relSling.setAttribute('x2', x.toFixed(1)); relSling.setAttribute('y2', y.toFixed(1)); relStone.setAttribute('cx', x.toFixed(1)); relStone.setAttribute('cy', y.toFixed(1));
  }
  var MACHINE_KEYS = { M: 1, m: 1, ratio: 1, sling: 1, rel: 1, hinged: 1, drag: 1, mb: 1, L3: 1 };
  function changed(k) {
    save();
    if (MACHINE_KEYS[k]) {
      rebuildIdle();
      if (S.scene === 'treb' && (G.phase === 'idle' || G.phase === 'landed')) { G.shot = null; G.phase = 'idle'; G.rope = null; G.ghost = null; }
    }
    if (S.scene === 'range' || k === 'm' || k === 'drag') queueChart();
    else drawChart();
  }
  inputs.forEach(function (el) {
    el.addEventListener('input', function () {
      var k = el.dataset.k;
      S[k] = el.type === 'checkbox' ? el.checked : clamp(+el.value, LIM[k][0], LIM[k][1]);
      syncInputs(); changed(k);
    });
  });
  root.querySelectorAll('[data-preset]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = PRESETS[b.dataset.preset]; Object.keys(STD).forEach(function (k) { S[k] = STD[k]; });
      Object.keys(p).forEach(function (k) { S[k] = p[k]; });
      syncInputs(); changed('M'); hint(PRESET_NOTE[b.dataset.preset]);
    });
  });
  root.querySelectorAll('[data-scene]').forEach(function (b) { b.addEventListener('click', function () { setScene(b.dataset.scene); }); });
  function setScene(sc) {
    S.scene = sc; save();
    root.querySelectorAll('[data-scene]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.scene === sc ? 'true' : 'false'); });
    D.getElementById('tb-ctl-treb').hidden = sc !== 'treb'; D.getElementById('tb-ctl-range').hidden = sc !== 'range';
    eHud.hidden = sc !== 'treb'; btnField.hidden = sc !== 'treb';
    fireBtn.textContent = sc === 'treb' ? 'Fire' : 'Launch';
    cv.setAttribute('aria-label', sc === 'treb' ? 'A counterweight trebuchet on a field, with a stone tower in the distance. Press Space or the Fire button to throw.'
      : 'Range finder: a stone launcher on a field. Drag on the picture to aim, or press Space to launch.');
    G.trails = []; G.marks = []; G.dust = []; G.rshot = null; G.shot = null; G.rope = null; G.ghost = null; G.phase = 'idle'; G.camInit = false;
    showReadouts(); queueChart();
  }
  function hint(t) { hintEl.textContent = t || ''; hintEl.hidden = !t; }

  // ---------- missions ----------
  var MIS = [
    { id: 'hit100', title: 'Hit the tower at 100 m', goal: 'Move the tower to 100 m and hit it. The standard machine throws much farther, so start with a lighter counterweight.' },
    { id: 'hit200', title: 'Hit the tower at 200 m', goal: 'Tune the counterweight or the release angle until the stone strikes the tower.' },
    { id: 'hit300', title: 'Hit the tower at 300 m', goal: 'You need more speed: a heavier counterweight, a lighter stone or a better release.' },
    { id: 'low45', title: 'Lower than 45°', goal: 'In the Range finder with air drag on, beat the 45° throw by at least 2 m using a lower angle.' },
    { id: 'release', title: 'Perfect release', goal: 'Change only the release angle until your machine throws within 0.5% of the farthest it can.' },
    { id: 'hinge', title: 'Hinge it', goal: 'Fire the same machine with a hinged and a fixed counterweight, and show the hinged one throws farther.' },
    { id: 'eff', title: 'Efficient engine', goal: 'Put more than 60% of the stored energy into the stone.' },
    { id: 'bull', title: 'Bullseye', goal: 'With air drag on, strike within 0.5 m of the middle of a tower at least 150 m away.' }
  ];
  var MHINT = {
    hit100: 'Tower moved to 100 m. Try a lighter counterweight.',
    hit200: 'Tower at 200 m. The standard machine overshoots a little: tune the counterweight or the release angle.',
    hit300: 'Tower at 300 m. Add counterweight, use a lighter stone, or find a better release angle.',
    low45: 'Range finder, drag on, a 2 kg stone at 80 m/s. Launch at 45°, then try lower angles. The gold curve on the chart shows where the best angle is.',
    release: 'Fire, change only the release angle, and fire again. Each shot adds a dot to the chart: find the top of the hill.',
    hinge: 'Standard machine loaded. Fire once, untick "Hinged counterweight" and fire again.',
    eff: 'Efficiency is the stone\'s energy ÷ the stored energy. A lighter beam (More settings) and a good release angle help.',
    bull: 'Tower at 250 m with drag on. Fine-tune with the release angle (0.5° steps) and the counterweight (5 kg steps); arrow keys help.'
  };
  var missions = L.missions(D.getElementById('tb-missions'), 'trebuchet', MIS, function (id) {
    if (id === 'low45') { setSceneIf('range'); S.drag = true; S.v = 80; S.ang = 45; S.m = 2; }
    else {
      setSceneIf('treb');
      if (id === 'hit100') S.target = 100; else if (id === 'hit200') S.target = 200; else if (id === 'hit300') S.target = 300;
      else if (id === 'bull') { S.target = 250; S.drag = true; }
      else if (id === 'hinge') { Object.keys(STD).forEach(function (k) { S[k] = STD[k]; }); S.drag = true; }
    }
    syncInputs(); changed('M'); hint(MHINT[id]);
    try { cv.focus({ preventScroll: true }); } catch (e) { }
  });
  function setSceneIf(sc) { if (S.scene !== sc) setScene(sc); }
  // toasts wait their turn, so several messages at once are all seen
  var toastQ = [], toastBusy = false;
  function say(t) { toastQ.push(t); if (!toastBusy) nextToast(); }
  function nextToast() { var t = toastQ.shift(); if (!t) { toastBusy = false; return; } toastBusy = true; L.toast(view, t); setTimeout(nextToast, 2300); }
  function done(id) {
    if (missions.done(id)) {
      var m = MIS.filter(function (x) { return x.id === id; })[0];
      say('✓ Mission done: ' + m.title);
      if (id === 'release') drawChart();
      return true;
    }
    return false;
  }

  // ---------- geometry helpers ----------
  var TW = 5, TH = 7.4;     // the tower: 5 m wide, solid up to about 7.4 m
  function towerImpact(path, T, rp) {
    var x0 = T - TW / 2 - rp, x1 = T + TW / 2 + rp, y1 = TH + rp;
    for (var i = 1; i < path.length; i++) {
      var a = path[i - 1], b = path[i], dx = b[1] - a[1], dy = b[2] - a[2];
      if (Math.max(a[1], b[1]) < x0 || Math.min(a[1], b[1]) > x1 || Math.min(a[2], b[2]) > y1) continue;
      // Liang–Barsky: entry parameter of the segment into the box
      var t0 = 0, t1 = 1, p = [-dx, dx, -dy], q = [a[1] - x0, x1 - a[1], a[2] - (-1)], ok = true;
      p.push(dy); q.push(y1 - a[2]);
      for (var j = 0; j < 4; j++) {
        if (p[j] === 0) { if (q[j] < 0) { ok = false; break; } }
        else { var r = q[j] / p[j]; if (p[j] < 0) { if (r > t1) { ok = false; break; } if (r > t0) t0 = r; } else { if (r < t0) { ok = false; break; } if (r < t1) t1 = r; } }
      }
      if (ok && t0 <= t1) return { t: a[0] + t0 * (b[0] - a[0]), x: a[1] + t0 * dx, y: Math.max(0, a[2] + t0 * dy) };
    }
    return null;
  }
  function pathAt(path, t) {
    var n = path.length; if (t <= 0) return [path[0][1], path[0][2], 0, 0];
    var i = Math.min(n - 2, Math.max(0, Math.floor(t * 120)));
    while (i < n - 2 && path[i + 1][0] <= t) i++;
    while (i > 0 && path[i][0] > t) i--;
    var a = path[i], b = path[i + 1] || a, dt = (b[0] - a[0]) || 1e-9, u = clamp((t - a[0]) / dt, 0, 1);
    return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, (b[1] - a[1]) / dt, (b[2] - a[2]) / dt];
  }
  function swingFrameAt(sw, t) {
    var f = sw.frames, n = f.length, i = Math.min(n - 2, Math.max(0, Math.floor(t / 1e-3)));
    while (i < n - 2 && f[i + 1].t <= t) i++;
    while (i > 0 && f[i].t > t) i--;
    var a = f[i], b = f[i + 1] || a, u = clamp((t - a.t) / ((b.t - a.t) || 1e-9), 0, 1);
    return { q: [a.q[0] + (b.q[0] - a.q[0]) * u, a.q[1] + (b.q[1] - a.q[1]) * u, a.q[2] + (b.q[2] - a.q[2]) * u], f: u < 0.5 ? a : b };
  }
  function afterAt(arr, t) {
    var n = arr.length, i = Math.min(n - 2, Math.max(0, Math.floor(t * 120)));
    if (n < 2) return arr[0].q.slice();
    var a = arr[i], b = arr[i + 1], u = clamp((t - a.t) / ((b.t - a.t) || 1e-9), 0, 1);
    return [a.q[0] + (b.q[0] - a.q[0]) * u, a.q[1] + (b.q[1] - a.q[1]) * u, a.q[2] + (b.q[2] - a.q[2]) * u];
  }
  function cockedQ(k) { return [k.th0, k.ph0, k.ps0]; }

  // ---------- firing ----------
  function archiveTrail() {
    var sh = G.shot;
    if (sh && sh.r.released && (G.phase === 'flight' || G.phase === 'landed')) {
      var tEnd = G.phase === 'landed' ? sh.tFly : Math.min(sh.tFly, G.pt - sh.tRel), pts = [];
      sh.r.flight.path.forEach(function (p) { if (p[0] <= tEnd) pts.push([p[1], p[2]]); });
      var e = pathAt(sh.r.flight.path, tEnd); pts.push([e[0], e[1]]);
      G.trails.push({ pts: pts, col: '#ffd479' }); if (G.trails.length > 4) G.trails.shift();
    }
  }
  function bestFor(k, sw) {
    var key = relKey(k.__o), c = G.best[key]; if (c) return c;
    var scan = P.releaseScan(k, sw, 0, 90, 2), b = [0, -Infinity];
    scan.forEach(function (s) { if (s[1] > b[1]) b = s; });
    var fine = P.releaseScan(k, sw, Math.max(0, b[0] - 2), Math.min(90, b[0] + 2), 0.25);
    fine.forEach(function (s) { if (s[1] > b[1]) b = s; });
    c = G.best[key] = { rel: b[0], range: b[1], scan: scan };
    return c;
  }
  function fire() {
    if (S.scene === 'range') { launch(); return; }
    if (G.phase === 'recock' || G.phase === 'swing') return;
    var o = mopts(), k = P.machine(o); k.__o = o;
    var sw = P.swing(k), r = P.shot(k, sw), sh = { k: k, sw: sw, r: r, o: o, target: S.target, tRel: Infinity, tFly: 0, impact: null };
    if (r.released) {
      sh.tRel = r.rel.t;
      sh.impact = towerImpact(r.flight.path, S.target, k.rp);
      sh.tFly = sh.impact ? sh.impact.t : r.time;
      sh.endX = sh.impact ? sh.impact.x : r.range; sh.endY = sh.impact ? sh.impact.y : 0;
      // the rest is needed only at release and landing, so it is worked out between frames
      setTimeout(function () { afterOf(sh); }, 16);
      setTimeout(function () { if (!sh.best) sh.best = bestFor(k, sw); }, 120);
    }
    archiveTrail();
    var from = G.pose && G.poseK ? G.pose.slice() : null, prevK = G.poseK;
    G.shot = sh; G.ghost = null; G.rope = null; G.landT = 0;
    showReadouts();
    if (from && !RM && prevK && Math.abs(from[0] - k.th0) > 0.02) { G.phase = 'recock'; G.rec = { from: from, k: prevK, t: 0, dur: 0.5 }; }
    else { G.phase = 'swing'; G.pt = 0; }
    if (!r.released) {
      var moved = sw.frames.some(function (f) { return Math.abs(f.q[0] - k.th0) > 0.02; });
      sh.fizzle = moved ? 'The stone never left the trough. Add counterweight, or use a lighter stone.' : 'The counterweight is too light to lift the arm and the stone.';
      say(sh.fizzle); live.textContent = sh.fizzle;
    }
  }
  function afterOf(sh) { if (!sh.after) sh.after = P.afterSwing(sh.k, sh.r.rel.q, sh.r.rel.v, Math.min(sh.r.time, 40) + 10, 1 / 120); return sh.after; }
  function onRelease() {
    var sh = G.shot; afterOf(sh);
    var r = sh.r, k = sh.k, p = P.points(k, r.rel.q), u = P.velocities(k, r.rel.q, r.rel.v);
    G.ghost = { O: [0, k.H], P: p.P, R: p.R, beta: r.rel.beta, v: [r.vx, r.vy], speed: r.speed, ang: r.angle, k: k };
    // the empty sling, as a rope of 9 points from the arm's tip to the pouch
    var n = 9, pts = [];
    for (var i = 0; i < n; i++) {
      var f = i / (n - 1);
      pts.push({ x: p.P[0] + (p.R[0] - p.P[0]) * f, y: p.P[1] + (p.R[1] - p.P[1]) * f, vx: u.P[0] + (u.R[0] - u.P[0]) * f, vy: u.P[1] + (u.R[1] - u.P[1]) * f });
    }
    G.rope = { pts: pts, seg: k.L4 / (n - 1) };
    showReadouts();
    live.textContent = 'Released at ' + num(r.speed, 1) + ' meters per second, ' + num(r.angle / RAD, 1) + ' degrees up.';
  }
  function onLand() {
    var sh = G.shot, r = sh.r, hit = !!sh.impact;
    if (!sh.best) sh.best = bestFor(sh.k, sh.sw);
    puff(sh.endX, sh.endY, hit ? 'stone' : 'dust', hit ? -1 : 1);
    G.marks.push({ x: sh.endX, y: sh.endY, hit: hit, label: num(sh.endX, 1) + ' m' }); if (G.marks.length > 8) G.marks.shift();
    if (hit) { G.flash = 1; say('Hit! The tower at ' + num(sh.target) + ' m'); }
    var key = relKey(sh.o); G.shots.push({ key: key, rel: sh.o.rel, range: r.range }); if (G.shots.length > 60) G.shots.shift();
    showReadouts(); drawChart();
    live.textContent = landText(sh).replace(/\n/g, '. ');
    // missions
    if (hit) {
      if (Math.abs(sh.target - 100) <= 5) done('hit100');
      if (Math.abs(sh.target - 200) <= 5) done('hit200');
      if (Math.abs(sh.target - 300) <= 5) done('hit300');
      if (sh.o.drag && sh.target >= 150 && Math.abs(sh.endX - sh.target) <= 0.5) done('bull');
    }
    if (r.eff > 0.6) done('eff');
    if (sh.best && r.range >= 0.995 * sh.best.range) done('release');
    var hk = hingeKey(sh.o), rec = G.hingeRec[hk] || (G.hingeRec[hk] = {});
    rec[sh.o.hinged ? 'h' : 'f'] = r.range;
    if (rec.h !== undefined && rec.f !== undefined) {
      if (rec.h > rec.f + 0.5) done('hinge');
      else if (!missions.isDone('hinge')) say('This time the fixed counterweight won. A hinge pays off when the counterweight is about 80 or more times the stone.');
    }
  }
  function landText(sh) {
    var r = sh.r;
    if (!r.released) return sh.fizzle || '';
    if (sh.impact) return 'Hit the tower ' + num(sh.endX, 1) + ' m away!\n' + (Math.abs(sh.endX - sh.target) <= 0.5 ? 'Right in the middle.' : num(Math.abs(sh.endX - sh.target), 1) + ' m from its middle');
    var a = r.angle / RAD, tip = a > 90 ? '\nThe sling let go far too early: try a much smaller release angle' : a > 56 ? '\nA steep throw: try a smaller release angle' : a < 28 ? '\nA flat throw: try a bigger release angle' : '';
    if (sh.endX < 0) return 'Landed ' + num(-sh.endX, 1) + ' m behind the trebuchet!' + tip;
    var d = sh.endX - sh.target;
    return 'Landed ' + num(sh.endX, 1) + ' m from the axle\n' + num(Math.abs(d), 1) + ' m ' + (d > 0 ? 'past' : 'short of') + ' the tower' + tip;
  }
  // ---------- range finder ----------
  function launch() {
    if (G.rshot) archiveRange();
    var th = S.ang * RAD, v = S.v, r0 = P.radiusOf(S.m), kd = P.dragK(S.m, true);
    var vac = P.fly(0, r0, v * Math.cos(th), v * Math.sin(th), { k: 0, yLand: r0, rec: 1 / 120 });
    var dr = S.drag ? P.fly(0, r0, v * Math.cos(th), v * Math.sin(th), { k: kd, yLand: r0, rec: 1 / 120 }) : null;
    G.rshot = { vac: vac, dr: dr, t: 0, v: v, ang: S.ang, m: S.m, drag: S.drag, doneV: false, doneD: !dr };
    G.phase = 'flight'; G.landT = 0;
    showReadouts();
  }
  function archiveRange() {
    var rs = G.rshot; if (!rs) return;
    [[rs.vac, '#74c0fc'], [rs.dr, '#ffd479']].forEach(function (a) {
      if (!a[0]) return; var pts = []; a[0].path.forEach(function (p) { if (p[0] <= rs.t) pts.push([p[1], p[2]]); });
      if (pts.length > 1) { G.trails.push({ pts: pts, col: a[1], dash: a[1] === '#74c0fc' && !!rs.dr }); }
    });
    while (G.trails.length > 6) G.trails.shift();
  }
  function rangeLanded(which) {
    var rs = G.rshot, f = which === 'vac' ? rs.vac : rs.dr;
    puff(f.range, 0, 'dust', 1);
    G.marks.push({ x: f.range, y: 0, label: num(f.range, 1) + ' m', col: which === 'vac' ? '#74c0fc' : '#ffd479' }); if (G.marks.length > 8) G.marks.shift();
    var main = rs.dr || rs.vac;
    if (f === main) {
      showReadouts();
      live.textContent = (rs.dr ? 'With air: ' + num(rs.dr.range, 1) + ' m. Without air: ' + num(rs.vac.range, 1) + ' m.' : 'Range ' + num(rs.vac.range, 1) + ' m.');
      if (rs.dr && rs.ang < 44.999) {
        var r0 = P.radiusOf(rs.m), r45 = P.fly(0, r0, rs.v * Math.SQRT1_2, rs.v * Math.SQRT1_2, { k: P.dragK(rs.m, true), yLand: r0 }).range;
        if (rs.dr.range >= r45 + 2) done('low45');
        else if (rs.dr.range > r45) say('Farther than 45°, by ' + num(rs.dr.range - r45, 2) + ' m. Make it at least 2 m: try a lighter stone or more speed.');
      }
    }
  }

  // ---------- particles ----------
  function puff(x, y, kind, dir) {
    var n = RM ? 0 : (kind === 'stone' ? 22 : 30);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI, sp = 1.5 + Math.random() * 5;
      G.dust.push({ x: x + (Math.random() - 0.5) * 1.2, y: y + 0.2, vx: Math.cos(a) * sp * 1.4 + dir * Math.random() * 2, vy: Math.sin(a) * sp, r: 0.35 + Math.random() * 0.6, age: 0, life: 1.1 + Math.random() * 1.1, col: kind === 'stone' ? (Math.random() < 0.5 ? '160,170,180' : '120,128,138') : (Math.random() < 0.5 ? '196,168,120' : '150,128,96') });
    }
    G.dust.push({ ring: true, x: x, y: y, age: 0, life: RM ? 1.6 : 0.9, r: 0.5 });
  }
  function updDust(h) {
    for (var i = G.dust.length - 1; i >= 0; i--) {
      var d = G.dust[i]; d.age += h;
      if (d.age > d.life) { G.dust.splice(i, 1); continue; }
      if (d.ring) continue;
      d.vy -= 3.5 * h; d.vx *= 1 - 1.4 * h; d.vy *= 1 - 1.4 * h; d.x += d.vx * h; d.y = Math.max(0.05, d.y + d.vy * h); d.r += 0.6 * h;
    }
  }
  // the empty sling after release: position-based rope pinned to the arm's tip
  function updRope(h, tip) {
    var R = G.rope; if (!R || h <= 0) return;
    var n = Math.max(1, Math.ceil(h / 0.002)), dt = h / n, pts = R.pts;
    for (var s = 0; s < n; s++) {
      var i, p;
      for (i = 1; i < pts.length; i++) { p = pts[i]; p.px = p.x; p.py = p.y; p.vy -= 9.81 * dt; p.vx *= 1 - 0.8 * dt; p.vy *= 1 - 0.8 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
      pts[0].x = tip[0]; pts[0].y = tip[1];
      for (var it = 0; it < 8; it++) {
        for (i = 1; i < pts.length; i++) {
          var a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, dd = Math.sqrt(dx * dx + dy * dy) || 1e-9, diff = (dd - R.seg) / dd;
          if (i === 1) { b.x -= dx * diff; b.y -= dy * diff; }
          else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
        }
        for (i = 1; i < pts.length; i++) if (pts[i].y < 0.05) pts[i].y = 0.05;
      }
      for (i = 1; i < pts.length; i++) { p = pts[i]; p.vx = (p.x - p.px) / dt; p.vy = (p.y - p.py) / dt; }
    }
  }

  // ---------- per-frame update ----------
  function speedNow() {
    var m = SPEEDS[G.spd].k;
    if (m !== 'auto') return m;
    if (S.scene !== 'treb') return 1;
    if (G.phase === 'swing') return 0.3;
    if (G.phase === 'flight' && G.shot) { var u = clamp((G.pt - G.shot.tRel) / 0.6, 0, 1); return 0.3 + 0.7 * u * u * (3 - 2 * u); }
    return 1;
  }
  function update(dt) {
    if (G.paused) return;
    var h = dt * speedNow();
    if (S.scene === 'treb') {
      var sh = G.shot;
      if (G.phase === 'recock') { G.rec.t += dt; if (G.rec.t >= G.rec.dur) { G.phase = 'swing'; G.pt = 0; } }
      else if (sh && G.phase === 'swing') {
        G.pt += h;
        if (sh.r.released && G.pt >= sh.tRel) { G.pt = Math.max(G.pt, sh.tRel); G.phase = 'flight'; onRelease(); }
        else if (!sh.r.released && G.pt >= sh.sw.frames[sh.sw.frames.length - 1].t) { G.phase = 'landed'; showReadouts(); }
      } else if (sh && G.phase === 'flight') {
        G.pt += h;
        if (G.pt - sh.tRel >= sh.tFly) { G.phase = 'landed'; onLand(); }
      } else if (G.phase === 'landed') { G.pt += h; G.landT += dt; }
      if (G.flash > 0) G.flash = Math.max(0, G.flash - dt * 0.6);
    } else if (G.rshot && G.phase === 'flight') {
      var rs = G.rshot; rs.t += h;
      if (!rs.doneV && rs.t >= rs.vac.time) { rs.doneV = true; rangeLanded('vac'); }
      if (!rs.doneD && rs.t >= rs.dr.time) { rs.doneD = true; rangeLanded('dr'); }
      if (rs.doneV && rs.doneD) { G.phase = 'landed'; G.landT = 0; showReadouts(); }
    } else if (G.phase === 'landed') G.landT += dt;
    G.bannerT += dt;
    updDust(h);
  }
  // the pose of the machine now: {k, q, stone:[x,y]|null, stoneAlpha, tip}
  function currentPose() {
    var sh = G.shot, k, q, stone = null, alpha = 1, E = null, inS = false;
    if (G.phase === 'recock') {
      var u = clamp(G.rec.t / G.rec.dur, 0, 1), u2 = clamp(u / 0.6, 0, 1), s = u2 * u2 * (3 - 2 * u2); k = sh.k;
      var c = cockedQ(k), f = G.rec.from;
      q = [f[0] + (c[0] - f[0]) * s, f[1] + (c[1] - f[1]) * s, c[2]];
      stone = P.points(k, c).R; alpha = clamp((u - 0.6) / 0.4, 0, 1); inS = true;
    } else if (sh && (G.phase === 'swing' || ((G.phase === 'landed') && !sh.r.released))) {
      k = sh.k; var fr = swingFrameAt(sh.sw, Math.min(G.pt, sh.tRel)); q = fr.q; E = fr.f.E; stone = P.points(k, q).R; inS = true;
    } else if (sh && (G.phase === 'flight' || G.phase === 'landed') && sh.r.released) {
      k = sh.k; q = afterAt(sh.after, G.pt - sh.tRel); E = sh.r.E;
      if (G.phase === 'flight') { var ps = pathAt(sh.r.flight.path, G.pt - sh.tRel); stone = [ps[0], ps[1]]; G.stoneV = [ps[2], ps[3]]; }
    } else { k = idleK; q = cockedQ(k); stone = P.points(k, q).R; inS = true; }
    G.pose = q; G.poseK = k;
    return { k: k, q: q, stone: stone, alpha: alpha, E: E, inSling: inS };
  }

  // ---------- camera ----------
  var cam = { x: 0, y: 8, s: 30 }, camInit = false;
  // the band of earth at the bottom holds the energy bar, the Fire button and the field strip; taller on a phone held upright
  function botM(h, w) { return h > w * 1.15 ? clamp(Math.round(h * 0.3), 120, 200) : clamp(Math.round(h * 0.17), 84, 116); }
  function fitBox(x0, x1, y0, y1, w, h, m) {
    m = m || { l: 12, r: 12, t: hudH + 16, b: botM(h, w) };
    var s = Math.min((w - m.l - m.r) / (x1 - x0), (h - m.t - m.b) / (y1 - y0));
    return { s: s, x: (x0 + x1) / 2 - (m.l + (w - m.l - m.r) / 2 - w / 2) / s, y: y0 + (h / 2 - m.b) / s };
  }
  function machineBox(k) {
    var reach = k.L1 + k.L4;
    return { x0: -(0.75 * k.L1 + k.L4) - 0.8, x1: Math.max(5.5, 0.5 * k.L1 + 0.45 * k.L4), y0: -0.3, y1: k.H + k.L1 + 0.55 * k.L4 + 0.3, reach: reach };
  }
  function camTarget(pose) {
    var w = K.w, h = K.h;
    if (S.scene === 'range') {
      if (G.aim && G.aimCam) return G.aimCam;
      var rs = G.rshot, R, pk;
      if (rs) { R = rs.vac.range; pk = rs.vac.peak; }
      else { var th = S.ang * RAD; R = S.v * S.v * Math.sin(2 * th) / P.G0; pk = Math.pow(S.v * Math.sin(th), 2) / (2 * P.G0); }
      return fitBox(-Math.max(6, 0.06 * R), Math.max(R, 25) + 10, -0.6, Math.max(pk, 6) + 5, w, h);
    }
    var mb = machineBox(pose.k), fm = fitBox(mb.x0, mb.x1, mb.y0, mb.y1, w, h);
    G.sMachine = fm.s; G.mBox = mb;
    var sh = G.shot;
    if (sh && sh.r.released && (G.phase === 'flight' || G.phase === 'landed')) {
      var peakTop = sh.r.flight.peak, endX = sh.endX;
      var over = function () { return fitBox(Math.min(mb.x0, endX - 12), Math.max(endX, sh.target, 30) + 14, -0.6, Math.max(peakTop + 8, mb.y1), w, h); };
      if (RM) return over();
      if (G.phase === 'landed' && G.landT > 1.1) return over();
      var sF = Math.min(fm.s, (h - botM(h, w) - hudH - 16) / (peakTop + 8), w / 50), st = G.phase === 'flight' && pose.stone ? pose.stone : [endX, sh.endY];
      var vx = G.phase === 'flight' && G.stoneV ? G.stoneV[0] : 1, dir = vx >= 0 ? 1 : -1, halfW = w / (2 * sF);
      var x = st[0] + dir * 0.16 * w / sF;
      if (dir > 0) x = Math.max(x, mb.x0 + halfW - 2);
      return { s: sF, x: x, y: -0.6 + (h / 2 - botM(h, w)) / sF };
    }
    if (G.field && G.phase !== 'swing' && G.phase !== 'recock') {
      var far = S.target + 14; G.marks.forEach(function (m) { far = Math.max(far, m.x + 14); });
      return fitBox(mb.x0, Math.max(far, 40), -0.6, Math.max(mb.y1, 18), w, h);
    }
    return fm;
  }
  function updCam(dt, pose) {
    var t = camTarget(pose);
    if (!camInit || RM || G.camInit === false) { cam.x = t.x; cam.y = t.y; cam.s = t.s; camInit = true; G.camInit = true; return; }
    var rate = G.phase === 'flight' ? 5 : 3, a = 1 - Math.exp(-rate * dt);
    cam.x += (t.x - cam.x) * a; cam.y += (t.y - cam.y) * a; cam.s = Math.exp(Math.log(cam.s) + (Math.log(t.s) - Math.log(cam.s)) * a);
  }
  function mkView(c, ox, oy, w, h) {
    return { x: c.x, y: c.y, s: c.s, w: w, h: h, ox: ox, oy: oy,
      X: function (x) { return this.ox + this.w / 2 + (x - this.x) * this.s; }, Y: function (y) { return this.oy + this.h / 2 - (y - this.y) * this.s; } };
  }

  // ---------- drawing ----------
  var stars = []; (function () { var a = 7; function r() { a = (a * 16807) % 2147483647; return a / 2147483647; } for (var i = 0; i < 80; i++) stars.push([r(), r() * 0.62, r() < 0.15 ? 1.6 : 0.9, 0.25 + r() * 0.5]); })();
  function lw(V, m, lo, hi) { return clamp(m * V.s, lo, hi); }
  function drawSky(c, V, inset) {
    var g = c.createLinearGradient(0, V.oy, 0, V.oy + V.h);
    g.addColorStop(0, '#06111a'); g.addColorStop(0.65, '#0b1d2b'); g.addColorStop(1, '#12293a');
    c.fillStyle = g; c.fillRect(V.ox, V.oy, V.w, V.h);
    if (!inset) {
      c.fillStyle = '#dbe7ef';
      for (var i = 0; i < stars.length; i++) { var s = stars[i]; c.globalAlpha = s[3]; c.fillRect(V.ox + s[0] * V.w, V.oy + s[1] * V.h, s[2], s[2]); }
      c.globalAlpha = 1;
      // a soft moon glow
      var mx = V.ox + V.w * 0.6, my = V.oy + V.h * 0.17, rg = c.createRadialGradient(mx, my, 2, mx, my, 70);
      rg.addColorStop(0, 'rgba(255,240,200,.22)'); rg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = rg; c.fillRect(mx - 70, my - 70, 140, 140);
      c.fillStyle = 'rgba(255,244,214,.85)'; c.beginPath(); c.arc(mx, my, 9, 0, 6.283); c.fill();
    }
    // two layers of hills that slide slowly as the camera pans
    var gy = V.Y(0);
    [[0.5, 46, '#0c2231', 0.011], [1.4, 24, '#0e2a27', 0.023]].forEach(function (L2) {
      c.fillStyle = L2[2]; c.beginPath(); c.moveTo(V.ox, gy + 1);
      for (var x = 0; x <= V.w + 8; x += 8) {
        var u = (x + V.x * L2[0]) * L2[3];
        c.lineTo(V.ox + x, gy - L2[1] * (0.55 + 0.25 * Math.sin(u) + 0.15 * Math.sin(u * 2.3 + 1.7) + 0.05 * Math.sin(u * 5.1)));
      }
      c.lineTo(V.ox + V.w, gy + 1); c.closePath(); c.fill();
    });
  }
  function drawGround(c, V) {
    var gy = V.Y(0); if (gy > V.oy + V.h) return;
    var g = c.createLinearGradient(0, gy, 0, V.oy + V.h);
    g.addColorStop(0, '#173326'); g.addColorStop(1, '#0a1712');
    c.fillStyle = g; c.fillRect(V.ox, gy, V.w, V.oy + V.h - gy);
    c.fillStyle = '#3d7a52'; c.fillRect(V.ox, gy - 1, V.w, 2);
    // distance markers
    var x0 = V.x - (V.w / 2) / V.s, x1 = V.x + (V.w / 2) / V.s, steps = [1, 2, 5, 10, 25, 50, 100, 200], step = 200;
    for (var i = 0; i < steps.length; i++) if (steps[i] * V.s >= 64) { step = steps[i]; break; }
    var minor = step / 5;
    c.strokeStyle = 'rgba(143,179,198,.35)'; c.lineWidth = 1; c.beginPath();
    if (minor * V.s >= 7) for (var xm = Math.ceil(x0 / minor) * minor; xm <= x1; xm += minor) { if (xm < 0) continue; var sx = Math.round(V.X(xm)) + 0.5; c.moveTo(sx, gy + 1); c.lineTo(sx, gy + 4); }
    c.stroke();
    c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
    for (var xs = Math.ceil(x0 / step) * step; xs <= x1; xs += step) {
      if (xs < 0) continue; var px = Math.round(V.X(xs)) + 0.5;
      c.fillStyle = 'rgba(143,179,198,.55)'; c.fillRect(px - 0.5, gy + 1, 1, 7);
      if (xs > 0) { c.fillStyle = 'rgba(143,179,198,.8)'; c.fillText(num(xs) + ' m', px, gy + 10); }
    }
  }
  function drawTower(c, V, T) {
    var x0 = V.X(T - TW / 2), x1 = V.X(T + TW / 2), y0 = V.Y(0), y1 = V.Y(7);
    if (x1 < V.ox - 40 || x0 > V.ox + V.w + 40) return;
    var w = x1 - x0, mer = 0.8 * V.s, flash = G.flash;
    var g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#6c7c89'); g.addColorStop(1, '#46545f');
    c.fillStyle = g; c.fillRect(x0, y1, w, y0 - y1);
    // battlements
    for (var i = 0; i < 5; i++) if (i % 2 === 0) c.fillRect(x0 + i * w / 5, y1 - mer, w / 5, mer + 1);
    if (V.s > 3) {
      c.strokeStyle = 'rgba(30,40,48,.55)'; c.lineWidth = 1; c.beginPath();
      for (var r = 1; r < 7; r++) { var yy = Math.round(V.Y(r)) + 0.5; c.moveTo(x0, yy); c.lineTo(x1, yy); var off = (r % 2) * 0.5; for (var b = off; b < TW; b += 1) { var xx = Math.round(V.X(T - TW / 2 + b)) + 0.5; c.moveTo(xx, yy); c.lineTo(xx, V.Y(r - 1)); } }
      c.stroke();
      c.fillStyle = '#1b2329'; var dw = 1.3 * V.s; c.beginPath(); c.moveTo(V.X(T) - dw / 2, y0); c.lineTo(V.X(T) - dw / 2, V.Y(1.7)); c.arc(V.X(T), V.Y(1.7), dw / 2, Math.PI, 0); c.lineTo(V.X(T) + dw / 2, y0); c.fill();
    }
    // the middle line, for aiming
    c.strokeStyle = 'rgba(249,168,212,.45)'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(V.X(T), y1 - mer); c.lineTo(V.X(T), y0); c.stroke(); c.setLineDash([]);
    // banner
    var px = V.X(T), top = y1 - mer - Math.max(14, 3.2 * V.s), wave = RM ? 0 : Math.sin(G.bannerT * 4) * 0.15;
    c.strokeStyle = '#cfd6dc'; c.lineWidth = Math.max(1, 0.08 * V.s); c.beginPath(); c.moveTo(px, y1 - mer); c.lineTo(px, top); c.stroke();
    var fw = Math.max(12, 2.2 * V.s), fh = Math.max(8, 1.2 * V.s);
    c.fillStyle = flash > 0 ? 'rgba(255,212,121,' + (0.6 + 0.4 * flash) + ')' : '#f9a8d4';
    c.beginPath(); c.moveTo(px, top); c.quadraticCurveTo(px + fw * 0.5, top + fh * (0.1 + wave), px + fw, top + fh * 0.15); c.lineTo(px + fw * 0.92, top + fh * 1.05); c.quadraticCurveTo(px + fw * 0.45, top + fh * (0.95 - wave), px, top + fh); c.closePath(); c.fill();
    if (flash > 0) { c.fillStyle = 'rgba(255,212,121,' + (flash * 0.35) + ')'; c.beginPath(); c.arc(px, (y0 + y1) / 2, Math.max(w, 30) * (1.3 - flash * 0.3), 0, 6.283); c.fill(); }
    c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = '#f9a8d4';
    c.fillText(num(T) + ' m', px, top - 4);
  }
  function plank(c, V, ax, ay, bx, by, w0, w1, colA, colB, edge) {
    var dx = bx - ax, dy = by - ay, l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l;
    c.beginPath();
    c.moveTo(V.X(ax + nx * w0 / 2), V.Y(ay + ny * w0 / 2)); c.lineTo(V.X(bx + nx * w1 / 2), V.Y(by + ny * w1 / 2));
    c.lineTo(V.X(bx - nx * w1 / 2), V.Y(by - ny * w1 / 2)); c.lineTo(V.X(ax - nx * w0 / 2), V.Y(ay - ny * w0 / 2)); c.closePath();
    var mx = (ax + bx) / 2, my = (ay + by) / 2, h = Math.max(w0, w1) / 2;
    var g = c.createLinearGradient(V.X(mx + nx * h), V.Y(my + ny * h), V.X(mx - nx * h) + 0.01, V.Y(my - ny * h) + 0.01);
    g.addColorStop(0, colA); g.addColorStop(1, colB); c.fillStyle = g; c.fill();
    if (edge) { c.strokeStyle = edge; c.lineWidth = lw(V, 0.03, 0.5, 1.2); c.stroke(); }
  }
  function drawFrame(c, V, k, back) {
    var H = k.H, d = back ? [0.32, 0.14] : [0, 0], A = back ? '#4a3220' : '#8a5b33', B = back ? '#2e1f13' : '#5a3a1f', E = back ? null : 'rgba(30,18,8,.6)';
    function pl(ax, ay, bx, by, w) { plank(c, V, ax + d[0], ay + d[1], bx + d[0], by + d[1], w, w, A, B, E); }
    if (back) pl(-3.7, 0.18, 3.7, 0.18, 0.36);
    else { plank(c, V, -3.7, 0.12, -2.3, 0.12, 0.3, 0.3, A, B, E); plank(c, V, 2.3, 0.12, 3.7, 0.12, 0.3, 0.3, A, B, E); }
    pl(-2.8, 0.3, -0.14, H, 0.26); pl(2.8, 0.3, 0.14, H, 0.26);
    pl(-3.6, 0.3, -1.55, 2.05, 0.16); pl(3.6, 0.3, 1.55, 2.05, 0.16);
    pl(-1.95, 1.6, 1.95, 1.6, 0.18);
  }
  function drawTrough(c, V) {
    c.fillStyle = '#0a130f'; c.fillRect(V.X(-7.2), V.Y(0.02), (9.2) * V.s, Math.max(2, 0.16 * V.s));
    c.fillStyle = 'rgba(176,122,69,.55)'; c.fillRect(V.X(-7.2), V.Y(0.02), 9.2 * V.s, Math.max(1, 0.04 * V.s));
  }
  function drawCW(c, V, k, q) {
    var side = Math.cbrt(k.M / 1800), bw = 1.3 * side, bh = 0.95 * side, ct = Math.cos(q[0]), st = Math.sin(q[0]);
    var Qx = -k.L2 * ct, Qy = k.H - k.L2 * st, C, ux, uy;
    if (k.hinged) { C = [Qx + k.L3 * Math.cos(q[1]), Qy + k.L3 * Math.sin(q[1])]; ux = -Math.cos(q[1]); uy = -Math.sin(q[1]); }
    else { C = [Qx, Qy]; ux = -st; uy = ct; if (uy < 0) { ux = -ux; uy = -uy; } }   // bolted across the end of the arm
    // ux,uy: the box's "up"; vx,vy: its "across"
    var vx = uy, vy = -ux;
    function pt(a, b) { return [V.X(C[0] + vx * a + ux * b), V.Y(C[1] + vy * a + uy * b)]; }
    if (k.hinged) {
      c.strokeStyle = '#9aa6b2'; c.lineWidth = lw(V, 0.06, 1, 3); c.beginPath();
      var t1 = pt(-bw * 0.35, bh / 2), t2 = pt(bw * 0.35, bh / 2);
      c.moveTo(V.X(Qx), V.Y(Qy)); c.lineTo(t1[0], t1[1]); c.moveTo(V.X(Qx), V.Y(Qy)); c.lineTo(t2[0], t2[1]); c.stroke();
    }
    var p1 = pt(-bw / 2, -bh / 2), p2 = pt(bw / 2, -bh / 2), p3 = pt(bw / 2, bh / 2), p4 = pt(-bw / 2, bh / 2);
    // stones heaped in the open top
    if (V.s > 6 && k.hinged) {
      c.fillStyle = '#7d8790';
      for (var i = 0; i < 5; i++) { var s = pt(-bw * 0.38 + i * bw * 0.19, bh / 2 + 0.04); c.beginPath(); c.arc(s[0], s[1], 0.13 * V.s, 0, 6.283); c.fill(); }
    }
    c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.lineTo(p3[0], p3[1]); c.lineTo(p4[0], p4[1]); c.closePath();
    var g = c.createLinearGradient(p1[0], p1[1], p3[0], p3[1]); g.addColorStop(0, '#9b6a3c'); g.addColorStop(1, '#5c3b1e'); c.fillStyle = g; c.fill();
    c.strokeStyle = '#2a1a0c'; c.lineWidth = lw(V, 0.04, 0.6, 1.6); c.stroke();
    if (V.s > 5) {
      c.strokeStyle = 'rgba(40,24,10,.55)'; c.lineWidth = 1; c.beginPath();
      for (var j = 1; j < 3; j++) { var a = pt(-bw / 2, -bh / 2 + j * bh / 3), b = pt(bw / 2, -bh / 2 + j * bh / 3); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); }
      c.stroke();
      c.strokeStyle = '#8b97a3'; c.lineWidth = lw(V, 0.07, 1, 3); c.beginPath();
      [[-bw / 2 + 0.08, 1], [bw / 2 - 0.08, 1]].forEach(function (e) { var a = pt(e[0], -bh / 2), b = pt(e[0], bh / 2); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); });
      c.stroke();
    }
    if (!k.hinged) { c.fillStyle = '#56626d'; var hq = [V.X(Qx), V.Y(Qy)]; c.beginPath(); c.arc(hq[0], hq[1], Math.max(1.5, 0.08 * V.s), 0, 6.283); c.fill(); }
  }
  function drawBeam(c, V, k, q) {
    var ct = Math.cos(q[0]), st = Math.sin(q[0]), nx = -st, ny = ct, H = k.H;
    function at(s, w) { return [V.X(s * ct + nx * w), V.Y(H + s * st + ny * w)]; }
    var pts = [at(-k.L2, 0.15), at(0, 0.21), at(k.L1, 0.075), at(k.L1, -0.075), at(0, -0.21), at(-k.L2, -0.15)];
    c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath();
    var a = at(0, 0.21), b = at(0, -0.21), g = c.createLinearGradient(a[0], a[1], b[0] + 0.01, b[1] + 0.01);
    g.addColorStop(0, '#c48c55'); g.addColorStop(0.5, '#93602f'); g.addColorStop(1, '#5e3b1b'); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(30,18,8,.7)'; c.lineWidth = lw(V, 0.03, 0.6, 1.4); c.stroke();
    if (V.s > 8) {
      c.strokeStyle = 'rgba(60,34,14,.45)'; c.lineWidth = 1; c.beginPath();
      [0.06, -0.05].forEach(function (o) { var p0 = at(-k.L2 + 0.2, o * 0.7), p1 = at(k.L1 - 0.3, o * 0.35); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); });
      c.stroke();
      c.strokeStyle = '#7f8b96'; c.lineWidth = lw(V, 0.08, 1.5, 4); c.beginPath();
      [-k.L2 + 0.22, -0.42, 0.42, k.L1 - 0.45].forEach(function (s) { var w = s < 0 ? 0.15 + (0.06 * (1 + s / k.L2)) : 0.21 - 0.135 * s / k.L1; var p0 = at(s, w + 0.01), p1 = at(s, -w - 0.01); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); });
      c.stroke();
    }
    // the prong at the tip
    var tip = at(k.L1, 0), pr = at(k.L1 + 0.32, 0.03);
    c.strokeStyle = '#c5ced6'; c.lineWidth = lw(V, 0.05, 1, 2.5); c.beginPath(); c.moveTo(tip[0], tip[1]); c.lineTo(pr[0], pr[1]); c.stroke();
    // axle
    var o = [V.X(0), V.Y(H)], r = Math.max(2, 0.2 * V.s);
    var ga = c.createRadialGradient(o[0] - r * 0.3, o[1] - r * 0.3, 1, o[0], o[1], r); ga.addColorStop(0, '#d5dde4'); ga.addColorStop(1, '#5d6a75');
    c.fillStyle = ga; c.beginPath(); c.arc(o[0], o[1], r, 0, 6.283); c.fill();
    c.fillStyle = '#2a333b'; c.beginPath(); c.arc(o[0], o[1], r * 0.35, 0, 6.283); c.fill();
  }
  function drawStone(c, V, x, y, rp, alpha, glow) {
    var sx = V.X(x), sy = V.Y(y), r = Math.max(3.2, rp * V.s);
    c.globalAlpha = alpha;
    if (glow) { var gg = c.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 4.5); gg.addColorStop(0, 'rgba(255,212,121,.45)'); gg.addColorStop(1, 'rgba(255,212,121,0)'); c.fillStyle = gg; c.beginPath(); c.arc(sx, sy, r * 4.5, 0, 6.283); c.fill(); }
    var g = c.createRadialGradient(sx - r * 0.35, sy - r * 0.35, r * 0.1, sx, sy, r); g.addColorStop(0, '#ebe5d9'); g.addColorStop(0.6, '#a9a297'); g.addColorStop(1, '#6d675e');
    c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 6.283); c.fill();
    c.globalAlpha = 1;
  }
  function drawSling(c, V, k, pose) {
    var p = P.points(k, pose.q), tip = [p.P[0] + 0.3 * Math.cos(pose.q[0]), p.P[1] + 0.3 * Math.sin(pose.q[0])];
    c.strokeStyle = '#d9c08c'; c.lineWidth = lw(V, 0.04, 1, 2);
    if (pose.inSling) {
      if (pose.alpha <= 0) return;
      var R = pose.stone, rp = k.rp, dx = R[0] - p.P[0], dy = R[1] - p.P[1], l = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / l, ny = dx / l, off = Math.max(rp * 1.1, 2.5 / V.s);
      c.beginPath(); c.moveTo(V.X(p.P[0]), V.Y(p.P[1])); c.lineTo(V.X(R[0] + nx * off), V.Y(R[1] + ny * off));
      c.moveTo(V.X(tip[0]), V.Y(tip[1])); c.lineTo(V.X(R[0] - nx * off), V.Y(R[1] - ny * off)); c.stroke();
      if (pose.alpha > 0) {
        drawStone(c, V, R[0], R[1], rp, pose.alpha, false);
        c.strokeStyle = '#8a5a33'; c.lineWidth = lw(V, 0.07, 1.5, 3.5); c.beginPath();
        var ang = Math.atan2(-(dy), dx), rr = Math.max(3.6, rp * V.s * 1.08);
        c.arc(V.X(R[0]), V.Y(R[1]), rr, ang - 1.35, ang + 1.35, true); c.stroke();
      }
      return;
    }
    if (G.rope && G.shot && k === G.shot.k) {
      var pts = G.rope.pts; c.beginPath(); c.moveTo(V.X(p.P[0]), V.Y(p.P[1]));
      for (var i = 1; i < pts.length; i++) c.lineTo(V.X(pts[i].x), V.Y(pts[i].y));
      c.stroke();
      var e = pts[pts.length - 1]; c.fillStyle = '#8a5a33'; c.beginPath(); c.arc(V.X(e.x), V.Y(e.y), Math.max(2, 0.1 * V.s), 0, 6.283); c.fill();
    }
  }
  function drawMachine(c, V, pose) {
    var k = pose.k;
    drawFrame(c, V, k, true);
    drawTrough(c, V);
    if (k.hinged) drawCW(c, V, k, pose.q);
    drawBeam(c, V, k, pose.q);
    if (!k.hinged) drawCW(c, V, k, pose.q);
    drawSling(c, V, k, pose);
    drawFrame(c, V, k, false);
    // the axle again, over the front frame
    var o = [V.X(0), V.Y(k.H)], r = Math.max(2, 0.2 * V.s);
    c.fillStyle = '#8e9ba6'; c.beginPath(); c.arc(o[0], o[1], r * 0.8, 0, 6.283); c.fill();
    c.fillStyle = '#2a333b'; c.beginPath(); c.arc(o[0], o[1], r * 0.3, 0, 6.283); c.fill();
  }
  function drawGhost(c, V) {
    var g = G.ghost; if (!g) return;
    c.save(); c.globalAlpha = 0.85;
    c.strokeStyle = 'rgba(116,192,252,.55)'; c.lineWidth = 1.2; c.setLineDash([4, 4]);
    c.beginPath(); c.moveTo(V.X(g.O[0]), V.Y(g.O[1])); c.lineTo(V.X(g.P[0]), V.Y(g.P[1])); c.lineTo(V.X(g.R[0]), V.Y(g.R[1])); c.stroke();
    // the arm's line carried on past the tip, and the release angle between it and the sling
    var ax = g.P[0] - g.O[0], ay = g.P[1] - g.O[1], al = Math.sqrt(ax * ax + ay * ay), ext = Math.min(2.5, g.k.L4 * 0.5);
    c.strokeStyle = 'rgba(219,231,239,.35)'; c.beginPath(); c.moveTo(V.X(g.P[0]), V.Y(g.P[1])); c.lineTo(V.X(g.P[0] + ax / al * ext), V.Y(g.P[1] + ay / al * ext)); c.stroke();
    c.setLineDash([]);
    var a0 = Math.atan2(ay, ax), a1 = a0 + g.beta, rr = Math.max(14, 1.2 * V.s);
    c.strokeStyle = '#ffd479'; c.lineWidth = 1.5; c.beginPath();
    c.arc(V.X(g.P[0]), V.Y(g.P[1]), rr, -a0, -a1, g.beta > 0); c.stroke();
    var am = (a0 + a1) / 2;
    c.font = '600 11px system-ui,sans-serif'; c.fillStyle = '#ffd479'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(deg(g.beta / RAD), V.X(g.P[0]) + Math.cos(am) * (rr + 14), V.Y(g.P[1]) - Math.sin(am) * (rr + 14));
    // launch velocity arrow
    var vl = clamp(g.speed * 0.9, 30, 90), ux = Math.cos(g.ang), uy = Math.sin(g.ang), sx = V.X(g.R[0]), sy = V.Y(g.R[1]);
    c.strokeStyle = '#63e6be'; c.fillStyle = '#63e6be'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + ux * vl, sy - uy * vl); c.stroke();
    c.beginPath(); c.moveTo(sx + ux * (vl + 7), sy - uy * (vl + 7)); c.lineTo(sx + ux * vl - uy * 4.5, sy - uy * vl - ux * 4.5); c.lineTo(sx + ux * vl + uy * 4.5, sy - uy * vl + ux * 4.5); c.closePath(); c.fill();
    c.textAlign = 'left'; c.fillText(num(g.speed, 1) + ' m/s at ' + num(g.ang / RAD, 1) + '°', sx + ux * vl + 10, sy - uy * vl);
    c.restore();
  }
  function drawTrails(c, V) {
    G.trails.forEach(function (t, i) {
      c.strokeStyle = t.col; c.globalAlpha = 0.18 + 0.1 * i / Math.max(1, G.trails.length - 1); c.lineWidth = 1.5;
      if (t.dash) c.setLineDash([5, 5]);
      c.beginPath(); t.pts.forEach(function (p, j) { if (j) c.lineTo(V.X(p[0]), V.Y(p[1])); else c.moveTo(V.X(p[0]), V.Y(p[1])); }); c.stroke();
      c.setLineDash([]);
    });
    c.globalAlpha = 1;
    G.marks.forEach(function (m, i) {
      var x = V.X(m.x), y = V.Y(m.y), last = i === G.marks.length - 1, col = m.col || (m.hit ? '#63e6be' : '#ffd479');
      c.globalAlpha = last ? 1 : 0.45;
      if (m.hit) { // a small star where the stone struck the tower
        c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath();
        for (var a = 0; a < 4; a++) { var ang = a * Math.PI / 4; c.moveTo(x - 6 * Math.cos(ang), y - 6 * Math.sin(ang)); c.lineTo(x + 6 * Math.cos(ang), y + 6 * Math.sin(ang)); }
        c.stroke(); c.globalAlpha = 1; return;
      }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, V.Y(0) + 1, Math.max(4, 0.7 * V.s), Math.max(1.5, 0.18 * V.s), 0, 0, 6.283); c.fill();
      c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 16); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(x, y - 16); c.lineTo(x + 8, y - 13); c.lineTo(x, y - 10); c.fill();
      if (last) { c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText(m.label, x, y - 19); }
    });
    c.globalAlpha = 1;
  }
  function drawPath(c, V, path, tEnd, col, dash, glow) {
    var n = path.length; if (n < 2) return null;
    c.strokeStyle = col; c.lineWidth = 2.2; if (dash) c.setLineDash([5, 5]);
    if (glow && !RM) { c.shadowColor = col; c.shadowBlur = 8; }
    c.beginPath(); c.moveTo(V.X(path[0][1]), V.Y(path[0][2]));
    for (var i = 1; i < n && path[i][0] <= tEnd; i++) c.lineTo(V.X(path[i][1]), V.Y(path[i][2]));
    var e = pathAt(path, tEnd); c.lineTo(V.X(e[0]), V.Y(e[1])); c.stroke();
    c.shadowBlur = 0; c.setLineDash([]);
    return e;
  }
  function drawDust(c, V) {
    G.dust.forEach(function (d) {
      var f = d.age / d.life;
      if (d.ring) { c.strokeStyle = 'rgba(255,212,121,' + (0.7 * (1 - f)) + ')'; c.lineWidth = 2; c.beginPath(); c.ellipse(V.X(d.x), V.Y(0), Math.max(6, (1 + 5 * f) * V.s), Math.max(2, (0.3 + 1.2 * f) * V.s), 0, 0, 6.283); c.stroke(); return; }
      var r = Math.max(1.5, d.r * V.s);
      c.fillStyle = 'rgba(' + d.col + ',' + (0.55 * (1 - f)) + ')'; c.beginPath(); c.arc(V.X(d.x), V.Y(d.y), r, 0, 6.283); c.fill();
    });
  }
  function drawLauncher(c, V) {
    var x = V.X(0), y = V.Y(0), th = S.ang * RAD, len = 20 + S.v * 0.9;
    c.fillStyle = '#3b2a1a'; c.beginPath(); c.ellipse(x, y, 16, 6, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#8a5b33'; c.fillRect(x - 3, y - 10, 6, 10);
    if (G.phase !== 'flight' || G.aim) {
      c.strokeStyle = 'rgba(255,212,121,.35)'; c.setLineDash([2, 5]); c.lineWidth = 1.5;
      var rs = P.radiusOf(S.m), v = S.v, t = 0, dt = 0.05;
      c.beginPath(); c.moveTo(x, y);
      for (var i = 0; i < 40; i++) { t += dt; var px = v * Math.cos(th) * t, py = v * Math.sin(th) * t - 4.903 * t * t; if (py < 0) break; c.lineTo(V.X(px), V.Y(py + rs)); }
      c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#ffd479'; c.fillStyle = '#ffd479'; c.lineWidth = 2.5;
      var ex = x + Math.cos(th) * len, ey = y - Math.sin(th) * len;
      c.beginPath(); c.moveTo(x, y - 4); c.lineTo(ex, ey - 4); c.stroke();
      c.beginPath(); c.moveTo(ex + Math.cos(th) * 8, ey - Math.sin(th) * 8 - 4); c.lineTo(ex - Math.sin(th) * 5, ey - Math.cos(th) * 5 - 4); c.lineTo(ex + Math.sin(th) * 5, ey + Math.cos(th) * 5 - 4); c.closePath(); c.fill();
      c.font = '600 12px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'bottom';
      c.fillText(num(S.v) + ' m/s · ' + deg(S.ang), ex + 10, ey - 6);
    }
  }
  function drawInset(c, pose) {
    if (S.scene !== 'treb' || cam.s > 0.42 * G.sMachine) return;
    var w = Math.min(210, Math.round(K.w * 0.34)), h = Math.round(w * 0.74), ox = K.w - w - 10, oy = 54;
    c.save();
    c.beginPath(); if (c.roundRect) c.roundRect(ox, oy, w, h, 10); else c.rect(ox, oy, w, h); c.clip();
    var mb = machineBox(pose.k), f = fitBox(mb.x0, mb.x1, mb.y0, mb.y1, w, h, { l: 6, r: 6, t: 6, b: 10 }), V = mkView(f, ox, oy, w, h);
    drawSky(c, V, true); drawGround(c, V); drawMachine(c, V, pose); drawGhost(c, V);
    if (pose.stone && !pose.inSling && pose.stone[0] < mb.x1 + 10) drawStone(c, V, pose.stone[0], pose.stone[1], pose.k.rp, 1, true);
    c.restore();
    c.strokeStyle = 'rgba(120,170,200,.45)'; c.lineWidth = 1; c.beginPath(); if (c.roundRect) c.roundRect(ox + 0.5, oy + 0.5, w - 1, h - 1, 10); else c.rect(ox + 0.5, oy + 0.5, w - 1, h - 1); c.stroke();
  }
  function drawMini(c, V, stoneX) {
    var x0 = 12, x1 = K.w - 12, y = K.h - 13;
    var hi = 120, lo = -20;
    if (S.scene === 'treb') hi = Math.max(320, S.target + 40);
    G.marks.forEach(function (m) { hi = Math.max(hi, m.x + 30); lo = Math.min(lo, m.x - 20); });
    if (G.rshot) hi = Math.max(hi, G.rshot.vac.range + 30);
    else if (S.scene === 'range') hi = Math.max(hi, S.v * S.v * Math.sin(2 * S.ang * RAD) / P.G0 + 30);
    if (stoneX !== null && stoneX !== undefined) { hi = Math.max(hi, stoneX + 30); lo = Math.min(lo, stoneX - 20); }
    function MX(x) { return x0 + (x - lo) / (hi - lo) * (x1 - x0); }
    c.fillStyle = 'rgba(6,17,26,.72)'; c.beginPath(); if (c.roundRect) c.roundRect(x0 - 6, y - 9, x1 - x0 + 12, 18, 9); else c.rect(x0 - 6, y - 9, x1 - x0 + 12, 18); c.fill();
    // the part of the field in view
    var vl = clamp(MX(V.x - V.w / 2 / V.s), x0, x1), vr = clamp(MX(V.x + V.w / 2 / V.s), x0, x1);
    c.fillStyle = 'rgba(116,192,252,.18)'; c.fillRect(vl, y - 6, Math.max(2, vr - vl), 12);
    c.strokeStyle = 'rgba(143,179,198,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y + 0.5); c.lineTo(x1, y + 0.5); c.stroke();
    c.font = '600 9px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = 'rgba(143,179,198,.75)';
    var st = hi - lo > 600 ? 200 : 100;
    for (var t = st; t < hi; t += st) { var px = MX(t); if (px > x1 - 14) break; c.fillRect(px, y - 2, 1, 4); }
    c.fillStyle = '#c48c55'; c.beginPath(); c.moveTo(MX(0), y - 5); c.lineTo(MX(0) - 4, y + 4); c.lineTo(MX(0) + 4, y + 4); c.fill();
    if (S.scene === 'treb') { c.fillStyle = '#f9a8d4'; c.fillRect(MX(S.target) - 2.5, y - 5, 5, 9); }
    G.marks.forEach(function (m, i) { c.fillStyle = m.col || (m.hit ? '#63e6be' : '#ffd479'); c.globalAlpha = i === G.marks.length - 1 ? 1 : 0.45; c.beginPath(); c.arc(MX(m.x), y, 2.5, 0, 6.283); c.fill(); });
    c.globalAlpha = 1;
    if (stoneX !== null && stoneX !== undefined) { c.fillStyle = '#fff2c4'; c.shadowColor = '#ffd479'; c.shadowBlur = RM ? 0 : 6; c.beginPath(); c.arc(MX(stoneX), y, 3.2, 0, 6.283); c.fill(); c.shadowBlur = 0; }
    c.fillStyle = 'rgba(143,179,198,.85)'; c.textAlign = 'right'; c.fillText(num(Math.round(hi / 10) * 10) + ' m', x1, y - 0.5 - 0.01);
  }

  function draw(pose) {
    var c = ctx, V = mkView(cam, 0, 0, K.w, K.h), stoneX = null;
    c.clearRect(0, 0, K.w, K.h);
    drawSky(c, V, false); drawGround(c, V);
    if (S.scene === 'treb') {
      drawTower(c, V, G.shot && G.phase === 'flight' ? G.shot.target : S.target);
      drawTrails(c, V);
      drawMachine(c, V, pose);
      drawGhost(c, V);
      var sh = G.shot;
      if (sh && sh.r.released && (G.phase === 'flight' || G.phase === 'landed')) {
        var e = drawPath(c, V, sh.r.flight.path, G.phase === 'flight' ? G.pt - sh.tRel : sh.tFly, '#ffd479', false, true);
        if (G.phase === 'flight' && e) { drawStone(c, V, e[0], e[1], sh.k.rp, 1, true); stoneX = e[0]; }
      } else if (pose.stone) stoneX = pose.stone[0];
    } else {
      drawTrails(c, V);
      drawLauncher(c, V);
      var rs = G.rshot;
      if (rs) {
        var tv = Math.min(rs.t, rs.vac.time), ev = drawPath(c, V, rs.vac.path, tv, '#74c0fc', !!rs.dr, !rs.dr);
        if (ev && !rs.doneV) drawStone(c, V, ev[0], ev[1], P.radiusOf(rs.m), rs.dr ? 0.55 : 1, !rs.dr);
        if (rs.dr) { var ed = drawPath(c, V, rs.dr.path, Math.min(rs.t, rs.dr.time), '#ffd479', false, true); if (ed && !rs.doneD) { drawStone(c, V, ed[0], ed[1], P.radiusOf(rs.m), 1, true); stoneX = ed[0]; } }
        else if (ev && !rs.doneV) stoneX = ev[0];
      }
    }
    drawDust(c, V);
    drawInset(c, pose);
    drawMini(c, V, stoneX);
  }

  // ---------- HUD, energy bar, readouts ----------
  var lastHud = '', hudTick = 0, hudH = 60;
  function setHud(t) { if (t !== lastHud) { hud.textContent = t; lastHud = t; hudH = hud.offsetHeight || hudH; } }
  function speedNote() { var sp = speedNow(); return sp < 0.99 ? ' · slow ' + (sp <= 0.26 ? '¼' : sp <= 0.31 ? '0.3' : num(sp, 1)) + '×' : sp > 1.01 ? ' · ' + num(sp, 0) + '×' : ''; }
  function hudText(pose) {
    if (G.paused) return 'Paused\n' + (lastHud.split('\n')[1] || '');
    if (S.scene === 'range') {
      var rs = G.rshot;
      if (!rs) return 'Range finder\n' + num(S.v) + ' m/s at ' + deg(S.ang) + '\n' + (S.drag ? 'Air drag on (' + num(S.m) + ' kg stone)' : 'No air');
      var m = rs.dr || rs.vac, e = pathAt(m.path, Math.min(rs.t, m.time));
      if (G.phase === 'flight') return 'Flight ' + num(Math.min(rs.t, m.time), 1) + ' s' + speedNote() + '\n' + num(e[0], 1) + ' m out, ' + num(Math.max(0, e[1] - P.radiusOf(rs.m)), 1) + ' m up';
      return rs.dr ? 'With air: ' + num(rs.dr.range, 1) + ' m\nWithout air: ' + num(rs.vac.range, 1) + ' m' : 'Range: ' + num(rs.vac.range, 1) + ' m\n(no air)';
    }
    var sh = G.shot;
    if (G.phase === 'idle') return 'Ready to fire\nCounterweight ' + num(S.M) + ' kg\nStone ' + num(S.m) + ' kg · tower ' + num(S.target) + ' m';
    if (G.phase === 'recock') return 'Winching the arm down…';
    if (G.phase === 'swing') {
      var fr = swingFrameAt(sh.sw, G.pt).f, u = P.velocities(sh.k, fr.q, fr.v).R, sp = Math.sqrt(u[0] * u[0] + u[1] * u[1]);
      return 'Swing ' + num(G.pt, 2) + ' s' + speedNote() + '\n' + (fr.ground ? 'Stone sliding in the trough' : 'Stone in the sling') + '\nStone speed ' + num(sp, 1) + ' m/s';
    }
    if (G.phase === 'flight') {
      var tt = G.pt - sh.tRel, ps = pose.stone || [0, 0], v = G.stoneV || [0, 0];
      return 'Flight ' + num(tt, 1) + ' s' + speedNote() + '\n' + num(ps[0], 1) + ' m out, ' + num(Math.max(0, ps[1] - sh.k.rp), 1) + ' m up\nStone speed ' + num(Math.sqrt(v[0] * v[0] + v[1] * v[1]), 1) + ' m/s';
    }
    return landText(sh);
  }
  function setEnergy(pose) {
    if (S.scene !== 'treb') return;
    var k = pose.k, E = pose.E, f = [0, 0, 0, 0, 1];
    if (E && G.shot) {
      var E0 = G.shot.sw.frames[0].E, st = k.stored || 1;
      var rem = E.cwV - k.M * k.g * k.yCmin, lift = (E.stoneV - E0.stoneV) + (E.beamV - E0.beamV);
      f = [E.stoneK / st, E.beamK / st, E.cwK / st, Math.max(0, lift) / st, Math.max(0, rem) / st];
    }
    var tot = 0; f.forEach(function (x) { tot += x; }); tot = Math.max(tot, 1e-9);
    for (var i = 0; i < 5; i++) eSeg[i].style.width = (100 * f[i] / tot).toFixed(2) + '%';
  }
  function row(dt, dd, cls) { return '<dt>' + dt + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + dd + '</dd>'; }
  function showReadouts() {
    var h = '';
    if (S.scene === 'treb') {
      var sh = G.shot, r = sh && sh.r, landed = sh && G.phase === 'landed', rel = sh && r.released && (G.phase === 'flight' || G.phase === 'landed');
      var k = sh ? sh.k : idleK;
      if (sh && !r.released && G.phase === 'landed') h += row('Result', 'no throw');
      else {
        h += row('Range', landed ? num(sh.endX, 1) + ' m' : '…', landed && sh.impact ? 'tb-hit' : '');
        h += row('Tower', landed ? (sh.impact ? 'hit ✓' : (sh.endX > sh.target ? num(sh.endX - sh.target, 1) + ' m long' : num(sh.target - sh.endX, 1) + ' m short')) : num(S.target) + ' m away', landed && sh.impact ? 'tb-hit' : '');
        h += row('Launch speed', rel ? num(r.speed, 1) + ' m/s' : '…');
        h += row('Launch angle', rel ? num(r.angle / RAD, 1) + '°' : '…');
        h += row('Efficiency', rel ? num(100 * r.eff, 1) + '%' : '…');
        h += row('Peak height', landed ? num(r.peak, 1) + ' m' : '…');
        h += row('Flight time', landed ? num(sh.tFly, 2) + ' s' : '…');
      }
      h += row('Stored energy', num(k.stored / 1000, 1) + ' kJ');
      if (rel) h += row('Stone\'s energy', num(r.keStone / 1000, 1) + ' kJ');
    } else {
      var rs = G.rshot, dn = rs && G.phase === 'landed', rc = rangeCurves();
      h += row('Range' + (rs && rs.dr ? ' with air' : ''), dn ? num((rs.dr || rs.vac).range, 1) + ' m' : '…');
      if (rs && rs.dr) h += row('Range without air', dn ? num(rs.vac.range, 1) + ' m' : '…');
      h += row('Peak height', dn ? num((rs.dr || rs.vac).peak - P.radiusOf(rs.m), 1) + ' m' : '…');
      h += row('Flight time', dn ? num((rs.dr || rs.vac).time, 2) + ' s' : '…');
      h += row('Best angle, no air', '45°');
      if (rc && rc.drag) h += row('Best angle, with air', num(rc.bestD, 1) + '°');
    }
    readEl.innerHTML = h;
  }

  // ---------- chart ----------
  var rcCache = null, chartT = 0;
  function queueChart() { clearTimeout(chartT); chartT = setTimeout(function () { rcCache = null; drawChart(); showReadouts(); }, 90); }
  function rangeCurves() {
    if (S.scene !== 'range') return null;
    var key = [S.v, S.m, S.drag].join('|');
    if (rcCache && rcCache.key === key) return rcCache;
    var r0 = P.radiusOf(S.m), kd = P.dragK(S.m, true), vac = [], dr = [], best = 0, bestD = 45;
    for (var a = 1; a <= 89; a += 1) {
      var th = a * RAD; vac.push([a, S.v * S.v * Math.sin(2 * th) / P.G0]);
      if (S.drag) { var rr = P.fly(0, r0, S.v * Math.cos(th), S.v * Math.sin(th), { k: kd, yLand: r0, dt: 4e-3, rec: 1e9 }).range; dr.push([a, rr]); if (rr > best) { best = rr; bestD = a; } }
    }
    if (S.drag) { // golden-section refinement of the best angle with drag
      var lo = bestD - 1, hi = bestD + 1, gr = 0.618034, f = function (A) { var t = A * RAD; return P.fly(0, r0, S.v * Math.cos(t), S.v * Math.sin(t), { k: kd, yLand: r0, dt: 2e-3, rec: 1e9 }).range; };
      for (var i = 0; i < 30; i++) { var c1 = hi - gr * (hi - lo), c2 = lo + gr * (hi - lo); if (f(c1) > f(c2)) hi = c2; else lo = c1; }
      bestD = (lo + hi) / 2;
    }
    rcCache = { key: key, vac: vac, dr: dr, drag: S.drag, bestD: bestD };
    return rcCache;
  }
  function drawChart() {
    CK.fit(); var c = CK.c, w = CK.w, h = CK.h, l = 38, r = 10, t = 12, b = 24;
    c.clearRect(0, 0, w, h);
    var series = [], ymax = 10, curve = null, cap = '';
    if (S.scene === 'range') {
      var rc = rangeCurves(); series = rc.dr.length ? [rc.vac, rc.dr] : [rc.vac];
      series.forEach(function (s) { s.forEach(function (p) { ymax = Math.max(ymax, p[1]); }); });
      cap = 'Range at every launch angle for ' + num(S.v) + ' m/s. Blue: no air, best at 45°.' + (rc.drag ? ' Gold: with air drag, best at ' + num(rc.bestD, 1) + '°.' : ' Turn on air drag to compare.') + ' Pink: your angle.';
    } else {
      var key = relKey(mopts()), pts = G.shots.filter(function (s) { return s.key === key; });
      pts.forEach(function (p) { ymax = Math.max(ymax, p.range); });
      var bc = G.best[key];
      if (bc && missions.isDone('release')) { curve = bc.scan; curve.forEach(function (p) { if (isFinite(p[1])) ymax = Math.max(ymax, p[1]); }); }
      series = [pts];
      cap = pts.length ? 'Your shots with this machine: release angle against range.' + (curve ? ' The line shows every release angle; its top is the best.' : ' Change only the release angle to draw the hill.') : 'Fire a few shots: each one adds a dot here, release angle against range.';
    }
    var ytop = niceMax(ymax * 1.08);
    c.font = '600 10px system-ui,sans-serif'; l = Math.max(30, Math.ceil(c.measureText(num(ytop) + ' m').width) + 8);
    function X(a) { return l + a / 90 * (w - l - r); } function Y(v) { return t + (1 - Math.max(0, v) / ytop) * (h - t - b); }
    c.font = '600 10px system-ui,sans-serif'; c.fillStyle = '#8fb3c6'; c.strokeStyle = 'rgba(120,170,200,.18)'; c.lineWidth = 1;
    c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var i = 0; i <= 4; i++) { var v = ytop * i / 4, yy = Math.round(Y(v)) + 0.5; c.beginPath(); c.moveTo(l, yy); c.lineTo(w - r, yy); c.stroke(); c.fillText(num(v) + (i === 4 ? ' m' : ''), l - 4, yy); }
    c.textAlign = 'center'; c.textBaseline = 'top';
    for (var a = 0; a <= 90; a += 15) { c.fillText(a + '°', X(a), h - b + 5); }
    if (S.scene === 'range') {
      var rc2 = rangeCurves();
      [[rc2.vac, '#74c0fc', true], [rc2.dr, '#ffd479', false]].forEach(function (sv) {
        if (!sv[0].length) return; c.strokeStyle = sv[1]; c.lineWidth = 2; if (sv[2] && rc2.drag) c.setLineDash([4, 3]);
        c.beginPath(); sv[0].forEach(function (p, j) { if (j) c.lineTo(X(p[0]), Y(p[1])); else c.moveTo(X(p[0]), Y(p[1])); }); c.stroke(); c.setLineDash([]);
      });
      var bv = S.v * S.v / P.G0; c.fillStyle = '#74c0fc'; c.beginPath(); c.arc(X(45), Y(bv), 3.5, 0, 6.283); c.fill();
      if (rc2.drag) { var t2 = rc2.bestD * RAD, bd = P.fly(0, P.radiusOf(S.m), S.v * Math.cos(t2), S.v * Math.sin(t2), { k: P.dragK(S.m, true), yLand: P.radiusOf(S.m), dt: 4e-3, rec: 1e9 }).range; c.fillStyle = '#ffd479'; c.beginPath(); c.arc(X(rc2.bestD), Y(bd), 3.5, 0, 6.283); c.fill(); }
      c.strokeStyle = '#f9a8d4'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(S.ang), t); c.lineTo(X(S.ang), h - b); c.stroke();
    } else {
      if (curve) { c.strokeStyle = 'rgba(255,212,121,.55)'; c.lineWidth = 1.5; c.beginPath(); var st = false; curve.forEach(function (p) { if (!isFinite(p[1])) { st = false; return; } if (st) c.lineTo(X(p[0]), Y(p[1])); else { c.moveTo(X(p[0]), Y(p[1])); st = true; } }); c.stroke(); }
      series[0].forEach(function (p, j) { var last = j === series[0].length - 1; c.fillStyle = last ? '#fff2c4' : '#ffd479'; c.beginPath(); c.arc(X(p.rel), Y(p.range), last ? 4.5 : 3, 0, 6.283); c.fill(); });
      c.strokeStyle = 'rgba(249,168,212,.7)'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(X(S.rel), t); c.lineTo(X(S.rel), h - b); c.stroke(); c.setLineDash([]);
    }
    chartCap.textContent = cap;
    chartEl.setAttribute('aria-label', cap);
  }
  function niceMax(v) { var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  W.addEventListener('resize', function () { drawChart(); });

  // ---------- tools, keyboard, pointer ----------
  function reset() {
    G.trails = []; G.marks = []; G.dust = []; G.shot = null; G.rshot = null; G.rope = null; G.ghost = null; G.phase = 'idle'; G.paused = false; G.flash = 0;
    btnPause.textContent = '❚❚'; btnPause.setAttribute('aria-label', 'Pause');
    showReadouts(); live.textContent = 'Reset.';
  }
  function togglePause() { G.paused = !G.paused; btnPause.textContent = G.paused ? '▶' : '❚❚'; btnPause.setAttribute('aria-label', G.paused ? 'Play' : 'Pause'); }
  function setSpeedBtn() { var s = SPEEDS[G.spd]; btnSpeed.textContent = s.label; btnSpeed.setAttribute('aria-label', 'Playback speed: ' + s.name + '. Press to change.'); btnSpeed.title = 'Playback speed: ' + s.name; }
  function toggleField() { G.field = !G.field; btnField.setAttribute('aria-pressed', G.field ? 'true' : 'false'); }
  btnPause.addEventListener('click', togglePause);
  btnReset.addEventListener('click', reset);
  btnSpeed.addEventListener('click', function () { G.spd = (G.spd + 1) % SPEEDS.length; setSpeedBtn(); });
  btnField.addEventListener('click', toggleField);
  fireBtn.addEventListener('click', fire);
  function nudge(k, d) { S[k] = clamp(Math.round((S[k] + d * STEP[k]) / STEP[k]) * STEP[k], LIM[k][0], LIM[k][1]); S[k] = +S[k].toFixed(2); syncInputs(); changed(k); }
  cv.addEventListener('keydown', function (e) {
    var key = e.key, tr = S.scene === 'treb';
    if (key === ' ' || key === 'Enter') { e.preventDefault(); fire(); }
    else if (key === 'p' || key === 'P') togglePause();
    else if (key === 'r' || key === 'R') reset();
    else if ((key === 'v' || key === 'V') && tr) toggleField();
    else if (key === 'ArrowUp') { e.preventDefault(); nudge(tr ? 'rel' : 'ang', 1); }
    else if (key === 'ArrowDown') { e.preventDefault(); nudge(tr ? 'rel' : 'ang', -1); }
    else if (key === 'ArrowRight') { e.preventDefault(); nudge(tr ? 'M' : 'v', 1); }
    else if (key === 'ArrowLeft') { e.preventDefault(); nudge(tr ? 'M' : 'v', -1); }
  });
  function aimFrom(e) {
    var rc = cv.getBoundingClientRect(), V = mkView(cam, 0, 0, K.w, K.h);
    var dx = e.clientX - rc.left - V.X(0), dy = V.Y(0) - (e.clientY - rc.top);
    if (dx < 2) dx = 2;
    var a = clamp(Math.round(Math.atan2(Math.max(dy, 1), dx) / RAD * 2) / 2, 1, 89), len = Math.sqrt(dx * dx + dy * dy);
    S.ang = a; S.v = clamp(Math.round((len - 20) / 0.9), 5, 100);
    syncInputs(); save(); queueChart();
  }
  cv.addEventListener('pointerdown', function (e) {
    try { cv.focus({ preventScroll: true }); } catch (er) { }
    if (S.scene !== 'range' || G.phase === 'flight') return;
    G.aim = true; G.aimCam = { x: cam.x, y: cam.y, s: cam.s };
    try { cv.setPointerCapture(e.pointerId); } catch (er) { }
    aimFrom(e);
  });
  cv.addEventListener('pointermove', function (e) { if (G.aim) aimFrom(e); });
  function endAim() { if (!G.aim) return; G.aim = false; G.aimCam = null; launch(); }
  cv.addEventListener('pointerup', endAim);
  cv.addEventListener('pointercancel', function () { G.aim = false; G.aimCam = null; });

  // ---------- main loop ----------
  function frame(dt) {
    K.fit();
    update(dt);
    var pose = currentPose();
    if (S.scene === 'treb' && G.rope && (G.phase === 'flight' || G.phase === 'landed') && !G.paused) {
      var p = P.points(pose.k, pose.q); updRope(dt * speedNow(), p.P);
    }
    updCam(dt, pose);
    draw(pose);
    if (++hudTick % 3 === 0 || G.phase === 'idle') setHud(hudText(pose));
    setEnergy(pose);
  }
  syncInputs(); setSpeedBtn(); setScene(S.scene);
  L.loop(frame, view);
  // a test hook for automated checks (harmless for visitors)
  W.__treb = { S: S, G: G, fire: fire, setScene: setScene, changed: changed, sync: syncInputs, missions: missions };
})();
