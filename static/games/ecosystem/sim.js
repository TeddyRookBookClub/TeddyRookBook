/* Predators and Prey: the page. Draws the meadow, the graphs and the phase plot on one canvas, and runs the controls,
   the Lotka–Volterra comparison, the grass experiment and the missions. The model lives in model.js (window.EcoModel):
   time in days, lengths in grass patches. */
(function () {
  'use strict';
  var LAB = window.TRBLab, EM = window.EcoModel;
  var root = document.getElementById('ecosystem-lab');
  if (!root || !LAB || !EM) return;
  function $(id) { return document.getElementById(id); }
  var view = $('eco-view'), cv = $('eco-cv'), K = LAB.canvas(cv), ctx = K.c;
  var fmt = LAB.fmt, reduced = LAB.reduced;
  var SEASON = EM.SEASON, YEAR = EM.YEAR, FW = EM.W, FH = EM.H, RAB = EM.RAB, FOX = EM.FOX;
  var DPS = 6;                          // model days per second at 1×
  var SPEEDS = [1, 5, 20, 60];
  var SAMPLE = 5;                       // days between points on the graphs
  var WIN = 40 * SEASON;                // days shown on the graphs
  var TRAIL = 16 * SEASON;              // days of the meadow's path on the phase plot
  var FIRST_SEED = 2029;                // the first run a visitor sees: clear cycles that last
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.2)', panel: '#0b1b27', green: '#63e6be', gold: '#ffd479', pink: '#f9a8d4', blue: '#74c0fc', red: '#ff8787' };
  var SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  var ui = LAB.store('ecosystem-ui');

  var SCENES = {
    classic: { p: {}, note: 'Rabbits rise, then foxes rise, then both fall. Watch the peaks take turns on the graph.' },
    lean: { p: { grow: 0.03 }, note: 'Grass grows back slowly. Fewer rabbits, smaller swings and only a few foxes.' },
    rich: { p: { grow: 0.08 }, note: 'Grass grows back fast. Lots of rabbits, but wild swings: watch for a crash.' },
    overhunt: { p: { hunt: 0.9, fLitter: 5, foxes0: 30 }, note: 'Thirty expert hunters with big litters. Watch the rabbits, and then the foxes.' },
    refuge: { p: { hunt: 0.9, fLitter: 5, refuge: 0.2 }, note: 'The same expert hunters, but rabbits can slip under the fence on the left, where foxes can’t follow.' },
    seasons: { p: { seasons: true }, note: 'Grass grows fastest in spring and slowest in winter, and fox cubs are born only in spring.' },
    bunnies: { p: { rabbits0: 20, foxes0: 0 }, note: 'Twenty rabbits and no foxes. They multiply until the grass can’t feed any more.' }
  };
  // sliders: model setting <-> slider value, and the text beside it
  var CTRL = {
    grow: ['eco-grow', function (v) { return v / 1000; }, function (p) { return Math.round(p * 1000); }, function (p) { return fmt(p * 100, 1) + '% a day'; }],
    refuge: ['eco-refuge', function (v) { return v / 100; }, function (p) { return Math.round(p * 100); }, function (p) { return p > 0 ? Math.round(p * 100) + '% of it' : 'none'; }],
    rabbits0: ['eco-r0', Number, Number, String],
    rLitter: ['eco-rl', Number, Number, String],
    grassFood: ['eco-gf', Number, Number, function (p) { return p + ' days'; }],
    foxes0: ['eco-f0', Number, Number, String],
    fLitter: ['eco-fl', Number, Number, String],
    rabbitFood: ['eco-rf', Number, Number, function (p) { return p + ' days'; }],
    hunt: ['eco-hunt', function (v) { return v / 100; }, function (p) { return Math.round(p * 100); }, function (p) { return Math.round(p * 100) + '%'; }]
  };
  var LVK = {
    a: ['eco-a', function (v) { return v / 100; }, function (p) { return Math.round(p * 100); }, function (p) { return fmt(p, 2); }],
    d: ['eco-d', function (v) { return v / 100; }, function (p) { return Math.round(p * 100); }, function (p) { return fmt(p, 2); }],
    Rs: ['eco-rs', Number, Number, String],
    Fs: ['eco-fs', Number, Number, String]
  };

  // ---------- state ----------
  var params = {}, knobs = { a: 1.2, d: 0.9, Rs: 250, Fs: 20 }, m = null;
  var S = {
    lvTuned: false, scene: 'classic', speedIx: clampInt(ui.get('speed', 1), 0, SPEEDS.length - 1, 1), paused: false, acc: 0, tap: 'look',
    seed: FIRST_SEED, started: false, r0: 0,
    lv: [1, 1], lvOn: false, q: null, lvT: NaN, orbit: [],
    emaR: 0, emaF: 0, pkR: EM.Peaks(0.3, 40), pkF: EM.Peaks(0.3, 5), pairs: [], lastLag: null,
    fx: [], tal: null, lastTal: null, sel: null, selGoneAt: 0,
    rMax: 400, fMax: 40, L: null, lastEvent: -1e9, gone: { r: false, f: false },
    haven: 0, long: 0, bounce: null, crashSeen: false, flakes: [],
    hudAt: 0, readAt: 0, tuftAt: 0, now: 0
  };
  var CAP = 8000, HS = { n: 0, t: new Float64Array(CAP), R: new Float32Array(CAP), F: new Float32Array(CAP), G: new Float32Array(CAP), LR: new Float32Array(CAP), LF: new Float32Array(CAP) };
  function histPush(t, R, F, G, LR, LF) {
    if (HS.n >= CAP) { var h = CAP >> 1; ['t', 'R', 'F', 'G', 'LR', 'LF'].forEach(function (k) { HS[k].copyWithin(0, h); }); HS.n -= h; }
    var i = HS.n++; HS.t[i] = t; HS.R[i] = R; HS.F[i] = F; HS.G[i] = G; HS.LR[i] = LR; HS.LF[i] = LF;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function clampInt(v, a, b, d) { v = Math.round(+v); return isFinite(v) ? clamp(v, a, b) : d; }

  // ---------- toasts and missions ----------
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.9) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  var MISSIONS = [
    { id: 'boom', title: 'Baby boom', goal: 'While food is plentiful, let the rabbits double their starting number.' },
    { id: 'chase', title: 'Foxes follow rabbits', goal: 'See a fox peak come after a rabbit peak. The graph marks the peaks for you.' },
    { id: 'crash', title: 'Too good at hunting', goal: 'With hunting success at 80% or more and no refuge, let the foxes eat their way into a crash.' },
    { id: 'haven', title: 'Safe haven', goal: 'Keep hunting success at 80% or more, but add a refuge. Keep rabbits and foxes alive for 40 seasons.' },
    { id: 'bounce', title: 'Bounce back', goal: 'Send a hard winter or a disease. Then see the rabbits get back to their earlier numbers, with nobody dying out for 8 seasons.' },
    { id: 'rhythm', title: 'Same rhythm', goal: 'Tune the equations until their cycle lasts as long as the meadow’s, within 10%.' },
    { id: 'grass', title: 'Grass for foxes', goal: 'With the grass experiment, find a grass regrowth that feeds more foxes than a lower one and a higher one.' },
    { id: 'long', title: 'The long haul', goal: 'With the seasons on, keep grass, rabbits and foxes going for 100 seasons in a row.' }
  ];
  var PICK = {
    boom: ['bunnies', 'Twenty rabbits, lots of grass and no foxes. Watch them multiply.'],
    chase: ['classic', 'Watch the graph: gold triangles mark rabbit peaks, red ones fox peaks.'],
    crash: ['overhunt', 'Thirty expert hunters. Watch the rabbits, then the foxes. Speed it up if you like.'],
    haven: ['refuge', 'The fence keeps the foxes out of the left side. Speed up to 60× and wait 40 seasons.'],
    bounce: ['classic', 'Let it run a few seasons, then press Hard winter or Rabbit disease. A refuge helps.'],
    rhythm: ['classic', 'Wait until the meadow’s rhythm shows, then turn the equation knobs a and d.'],
    grass: ['classic', 'Each grass setting is measured for 42 seasons (try 60×). Test one, then a lower and a higher one.'],
    long: ['seasons', 'The seasons are on. Speed up to 60× and keep everyone alive for 100 seasons.']
  };
  var MS = LAB.missions($('eco-missions'), 'ecosystem', MISSIONS, function (id) {
    var p = PICK[id]; if (!p) return; loadScene(p[0]); toastQ = []; toastAt = -10; say(p[1]);
  });
  function win(id, text) { if (MS.done(id)) { var mm = MISSIONS.filter(function (x) { return x.id === id; })[0]; say('✓ ' + mm.title + ': ' + text); } }

  // ---------- controls ----------
  function syncControls() {
    for (var k in CTRL) { var c = CTRL[k], el = $(c[0]); el.value = c[2](params[k]); $(c[0] + '-o').textContent = c[3](params[k]); }
    $('eco-seasons').checked = !!params.seasons;
    for (k in LVK) { c = LVK[k]; el = $(c[0]); el.value = c[2](knobs[k]); $(c[0] + '-o').textContent = c[3](knobs[k]); }
    var bs = $('eco-scenes').querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-scene') === S.scene ? 'true' : 'false');
  }
  Object.keys(CTRL).forEach(function (k) {
    var c = CTRL[k], el = $(c[0]);
    el.addEventListener('input', function () {
      params[k] = c[1](+el.value); $(c[0] + '-o').textContent = c[3](params[k]);
      if (k === 'rabbits0' || k === 'foxes0') return;          // used when you start again
      if (k === 'refuge') m.setRefuge(params.refuge); else m.p[k] = params[k];
      if (k === 'grow') expStart(); else expStop('you changed another setting');
    });
  });
  $('eco-seasons').addEventListener('change', function () { params.seasons = m.p.seasons = $('eco-seasons').checked; expStop('you changed another setting'); });
  Object.keys(LVK).forEach(function (k) {
    var c = LVK[k], el = $(c[0]);
    el.addEventListener('input', function () { knobs[k] = c[1](+el.value); $(c[0] + '-o').textContent = c[3](knobs[k]); if (k === 'a' || k === 'd') S.lvTuned = true; lvChanged(); });
  });
  $('eco-scenes').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-scene]'); if (!b) return;
    loadScene(b.getAttribute('data-scene')); toastQ = []; toastAt = -10; say(SCENES[S.scene].note);
  });
  $('eco-tap').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tap]'); if (!b) return; S.tap = b.getAttribute('data-tap');
    var bs = $('eco-tap').querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
    cv.classList.toggle('eco-add', S.tap !== 'look'); if (S.tap !== 'look') S.sel = null;
  });
  $('eco-winter').addEventListener('click', function () { sendEvent('winter'); });
  $('eco-disease').addEventListener('click', function () { sendEvent('disease'); });
  $('eco-restart').addEventListener('click', function () { restart(); });
  $('eco-reset').addEventListener('click', function () { restart(); });
  $('eco-pause').addEventListener('click', togglePause);
  $('eco-speed').addEventListener('click', function () { setSpeed((S.speedIx + 1) % SPEEDS.length); });
  $('eco-lvmatch').addEventListener('click', lvMatch);
  $('eco-lvrestart').addEventListener('click', function () { lvFromMeadow(); say('The equations start again from the meadow’s numbers.'); });
  function togglePause() {
    S.paused = !S.paused; var b = $('eco-pause');
    b.textContent = S.paused ? '▶' : '❚❚'; b.setAttribute('aria-label', S.paused ? 'Play' : 'Pause'); b.title = S.paused ? 'Play (space)' : 'Pause (space)';
  }
  function setSpeed(i) {
    S.speedIx = clamp(i, 0, SPEEDS.length - 1); ui.set('speed', S.speedIx);
    var b = $('eco-speed'); b.textContent = SPEEDS[S.speedIx] + '×'; b.setAttribute('aria-label', 'Speed: ' + SPEEDS[S.speedIx] + ' times, ' + SPEEDS[S.speedIx] * DPS + ' days a second');
  }

  function loadScene(id) {
    S.scene = SCENES[id] ? id : 'classic';
    params = {}; for (var k in EM.DEFAULTS) params[k] = EM.DEFAULTS[k];
    var sp = SCENES[S.scene].p; for (k in sp) params[k] = sp[k];
    $('eco-note').textContent = SCENES[S.scene].note;
    restart();
  }

  function restart() {
    if ($('eco-fixed').checked) S.seed = clampInt($('eco-seed').value, 1, 99999, FIRST_SEED);
    else if (S.started) S.seed = 1 + Math.floor(Math.random() * 99999);
    S.started = true; $('eco-seed').value = S.seed;
    var p = {}; for (var k in params) p[k] = params[k];
    m = EM.create(p, S.seed);
    var R = m.rabbits.length, F = m.foxes.length;
    S.acc = 0; S.r0 = R; S.fx = []; S.sel = null; S.pairs = []; S.lastLag = null;
    S.pkR.reset(); S.pkF.reset(); S.emaR = R; S.emaF = F;
    S.tal = newTal(); S.lastTal = null; S.lastEvent = -1e9; S.gone = { r: !R, f: !F };
    S.haven = 0; S.long = 0; S.bounce = null; S.crashSeen = false;
    HS.n = 0;
    S.lv = [Math.max(1, R), Math.max(1, F)]; S.lvOn = R > 0 && F > 0; lvChanged();
    histPush(0, R, F, m.grassMean(), S.lvOn ? S.lv[0] : NaN, S.lvOn ? S.lv[1] : NaN);
    S.rMax = niceCeil(Math.max(R * 2.2, knobs.Rs * 1.4, 100)); S.fMax = niceCeil(Math.max(F * 2.5, knobs.Fs * 1.4, 10));
    expStart(true);
    syncControls(); updateReadouts(); updateHud();
  }
  function newTal() { return { rb: 0, fb: 0, re: 0, rs: 0, fs: 0 }; }

  // ---------- the equations ----------
  function lvChanged() {
    S.q = { a: knobs.a / SEASON, d: knobs.d / SEASON, Rs: knobs.Rs, Fs: knobs.Fs };
    S.lvT = S.lvOn ? EM.lv.period(S.lv[0], S.lv[1], S.q) : NaN;
    // the whole loop the equations are on, for the phase plot
    S.orbit = [];
    if (S.lvOn && isFinite(S.lvT)) {
      var st = [S.lv[0], S.lv[1]], n = 720, h = S.lvT / n;
      for (var i = 0; i <= n; i++) { if (i % 4 === 0) S.orbit.push(st[0], st[1]); st = EM.lv.rk4(st, S.q, h); }
    }
  }
  function lvFromMeadow() {
    var R = m.rabbits.length, F = m.foxes.length;
    S.lvOn = R > 0 && F > 0; S.lv = [Math.max(1, R), Math.max(1, F)]; lvChanged();
  }
  function lvMatch() {
    var t0 = m.day - 20 * SEASON, sR = 0, sF = 0, n = 0;
    for (var i = HS.n - 1; i >= 0 && HS.t[i] >= t0; i--) { sR += HS.R[i]; sF += HS.F[i]; n++; }
    if (n < 10 || sF === 0) { say('Let the meadow run for a season or two first, with foxes in it.'); return; }
    knobs.Rs = clamp(Math.round(sR / n / 10) * 10, 20, 600); knobs.Fs = clamp(Math.round(sF / n), 2, 80);
    syncControls(); lvFromMeadow();
    say('Balance point set to the meadow’s averages: ' + knobs.Rs + ' rabbits, ' + knobs.Fs + ' foxes.');
  }
  function meadowPeriod() {
    var P = S.pkR.peaks, n = P.length; if (n < 3) return NaN;
    var k = Math.min(3, n - 1); return (P[n - 1].t - P[n - 1 - k].t) / k;
  }

  // ---------- events and visitors' animals ----------
  function sendEvent(kind) {
    var pre = 0, n = 0;
    for (var i = HS.n - 1; i >= 0 && HS.t[i] >= m.day - 4 * SEASON; i--) { pre += HS.R[i]; n++; }
    pre = n ? pre / n : m.rabbits.length;
    if (kind === 'winter') { m.hardWinter(); say('❄️ A hard winter: for 30 days the grass grows at half speed and the cold burns extra energy.'); makeFlakes(); }
    else { var k = m.disease(0.6); collectFx(true); say('🦠 A disease sweeps through the rabbits: ' + k + ' of them die.'); }
    S.lastEvent = m.day;
    if (pre > 10 && m.foxes.length) S.bounce = { t0: m.day, pre: pre, back: false, what: kind === 'winter' ? 'hard winter' : 'disease' };
    expStop('an event shook the meadow');
  }
  function addPair(kind, x, y) {
    for (var i = 0; i < 2; i++) {
      var dx = (i ? 0.6 : -0.6), o;
      if (kind === 'rabbit') o = m.addRabbit(x + dx, y);
      else o = m.addFox(x + dx, y);
      o.px = o.x; o.py = o.y;
      S.fx.push({ k: kind === 'rabbit' ? 'rb' : 'fb', x: o.x, y: o.y, t: S.now });
    }
    if (kind === 'rabbit') S.gone.r = false; else S.gone.f = false;
    if (!S.lvOn && m.rabbits.length && m.foxes.length) lvFromMeadow();
    expStop('animals were added');
  }

  // ---------- the grass experiment ----------
  var EXP = { rows: [], cur: null, fp: '', note: '' }, EXP_LEN = 40;   // seasons counted for each grass setting
  function fingerprint() { var p = m.p; return [p.rLitter, p.fLitter, p.grassFood, p.rabbitFood, p.hunt, p.refuge, p.seasons ? 1 : 0].join('|'); }
  function expStart(quiet) {
    var fp = fingerprint();
    if (fp !== EXP.fp) { EXP.rows = []; EXP.fp = fp; }
    if (!m.foxes.length) { EXP.cur = null; EXP.note = 'There are no foxes in the meadow, so there is nothing to measure. Add some, or pick a scene with foxes.'; drawExp(); return; }
    EXP.cur = { g: m.p.grow, t0: m.day + 2 * SEASON, t1: m.day + (2 + EXP_LEN) * SEASON, sum: 0 };
    EXP.note = ''; drawExp();
  }
  function expStop(why) { if (!EXP.cur) return; EXP.cur = null; EXP.note = 'Measurement stopped: ' + why + '. Change the grass regrowth or start again to measure again.'; drawExp(); }
  function expDay(F) {
    var c = EXP.cur; if (!c) return;
    if (m.day > c.t0) c.sum += F;
    if (m.day >= c.t1 || (F === 0 && m.day > c.t0 - 2 * SEASON + 30)) {
      var avg = c.sum / (EXP_LEN * SEASON);
      EXP.rows = EXP.rows.filter(function (r) { return Math.abs(r.g - c.g) > 1e-9; });
      EXP.rows.push({ g: c.g, avg: avg }); EXP.rows.sort(function (a, b) { return a.g - b.g; });
      EXP.cur = null;
      EXP.note = 'Measured ' + fmt(c.g * 100, 1) + '%: ' + fmt(avg, 1) + ' foxes on average' + (F === 0 ? ' (the foxes died out)' : '') + '. Move the grass slider to test another setting.';
      drawExp();
      if (EXP.rows.length >= 3) {
        var best = EXP.rows.reduce(function (a, b) { return b.avg > a.avg ? b : a; });
        var lower = EXP.rows.some(function (r) { return r.g < best.g; }), higher = EXP.rows.some(function (r) { return r.g > best.g; });
        if (lower && higher) win('grass', fmt(best.g * 100, 1) + '% fed the most foxes, ' + fmt(best.avg, 1) + ' on average. More grass isn’t always better.');
      }
    }
  }
  function drawExp() {
    var tb = $('eco-exp'), best = null;
    EXP.rows.forEach(function (r) { if (!best || r.avg > best.avg) best = r; });
    var html = EXP.rows.map(function (r) {
      return '<tr' + (r === best && EXP.rows.length > 1 ? ' class="eco-best"' : '') + '><td>' + fmt(r.g * 100, 1) + '% a day</td><td>' + fmt(r.avg, 1) + (r === best && EXP.rows.length > 1 ? ' ★' : '') + '</td></tr>';
    }).join('');
    if (EXP.cur) html += '<tr class="eco-run"><td>' + fmt(EXP.cur.g * 100, 1) + '% a day</td><td id="eco-exp-prog">measuring…</td></tr>';
    tb.innerHTML = html || '<tr><td colspan="2">No results yet.</td></tr>';
    expStatus();
  }
  function expStatus() {
    var c = EXP.cur, st = $('eco-exp-status');
    if (c) {
      var f = clamp((m.day - (c.t0 - 2 * SEASON)) / ((2 + EXP_LEN) * SEASON), 0, 1), pr = $('eco-exp-prog');
      if (pr) pr.textContent = 'measuring… ' + Math.round(f * 100) + '%';
      st.textContent = m.day < c.t0 ? 'Measuring ' + fmt(c.g * 100, 1) + '%: letting the meadow settle for 2 seasons, then counting foxes for ' + EXP_LEN + '.' : 'Measuring ' + fmt(c.g * 100, 1) + '%: counting foxes for ' + EXP_LEN + ' seasons. Leave the other settings alone.';
    } else st.textContent = EXP.note || 'Change the grass regrowth, or start again, to measure how many foxes it feeds.';
  }

  // ---------- one day ----------
  function stepDay(showFx) {
    m.step();
    var R = m.rabbits.length, F = m.foxes.length, t = m.day, tl = m.tally, i;
    collectFx(showFx);
    S.tal.rb += tl.rBorn; S.tal.fb += tl.fBorn; S.tal.re += tl.rEaten; S.tal.rs += tl.rStarved; S.tal.fs += tl.fStarved;
    if (t % SEASON === 0) { S.lastTal = S.tal; S.tal = newTal(); }
    if (S.lvOn) S.lv = EM.lv.rk4(S.lv, S.q, 1);
    var k = 1 - Math.exp(-1 / 15);
    S.emaR += k * (R - S.emaR); S.emaF += k * (F - S.emaF);
    S.pkR.push(t, S.emaR);
    var ev = S.pkF.push(t, S.emaF);
    if (ev && ev.kind === 'peak') foxPeak(ev);
    if (t % SAMPLE === 0) histPush(t, R, F, m.grassMean(), S.lvOn ? S.lv[0] : NaN, S.lvOn ? S.lv[1] : NaN);
    // someone died out
    if (!R && !S.gone.r) { S.gone.r = true; say(F ? 'The rabbits are gone. With nothing to eat, the foxes will starve.' : 'The rabbits are gone too. Only the grass is left.'); }
    if (!F && !S.gone.f) { S.gone.f = true; say(R ? 'The last fox is gone. Tap “Add 2 foxes”, or start again.' : 'The last fox is gone. Only the grass is left.'); }
    // missions that watch the days go by
    if (S.r0 >= 10 && R >= 2 * S.r0) win('boom', R + ' rabbits from ' + S.r0 + '. With food and no danger, numbers multiply fast.');
    if (m.p.hunt >= 0.8 && m.p.refuge === 0 && (!R || !F) && !S.crashSeen && t - S.lastEvent > 4 * SEASON) {
      S.crashSeen = true; win('crash', !R ? 'the foxes ate every rabbit, and now they will starve.' : 'the foxes ate their own food supply and starved.');
    }
    if (m.p.hunt >= 0.8 && m.p.refuge >= 0.1 && R && F) { if (++S.haven >= 40 * SEASON) win('haven', '40 seasons with deadly hunters. The refuge keeps a seed stock of rabbits.'); } else S.haven = 0;
    if (m.p.seasons && R && F) { if (++S.long >= 100 * SEASON) win('long', '100 seasons, 25 model years, with everyone still here.'); } else S.long = 0;
    var b = S.bounce;
    if (b) {
      if (!R || !F) { S.bounce = null; say('Someone died out after the ' + b.what + '. Try again, maybe with a refuge.'); }
      else {
        if (t - b.t0 > 30 && R >= 0.8 * b.pre) b.back = true;
        if (b.back && t - b.t0 >= 8 * SEASON) { S.bounce = null; win('bounce', 'the meadow recovered from the ' + b.what + '.'); }
      }
    }
    expDay(F);
    if (S.sel && S.sel.dead && !S.selGoneAt) S.selGoneAt = S.now;
  }
  function foxPeak(ev) {
    var P = S.pkR.peaks, rp = null;
    for (var i = P.length - 1; i >= 0; i--) if (P[i].t < ev.t) { rp = P[i]; break; }
    if (!rp) return;
    var lag = ev.t - rp.t, last = S.pairs[S.pairs.length - 1];
    if (last && last.tr === rp.t) return;              // that rabbit peak already has its fox peak
    if (lag < 20 || lag > 8 * SEASON) return;
    S.pairs.push({ tr: rp.t, vr: rp.v, tf: ev.t, vf: ev.v }); S.lastLag = lag;
    win('chase', 'the fox peak came ' + fmt(lag / SEASON, 1) + ' seasons after the rabbit peak.');
  }
  var FXMAX = 90;
  function collectFx(show) {
    var list = m.fx; if (!show || !list.length) return;
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      var sp = SPEEDS[S.speedIx];
      if (sp >= 60 || (sp >= 20 && e.k !== 'catch' && e.k !== 'sick')) continue;
      S.fx.push({ k: e.k, x: e.x, y: e.y, t: S.now });
    }
    var cap = SPEEDS[S.speedIx] >= 20 ? 30 : FXMAX;
    if (S.fx.length > cap) S.fx.splice(0, S.fx.length - cap);
  }

  // ---------- the loop ----------
  LAB.loop(function (dt) {
    S.now = performance.now() / 1000;
    if (!S.paused && m) {
      S.acc += dt * DPS * SPEEDS[S.speedIx];
      var steps = 0;
      while (S.acc >= 1 && steps < 30) { stepDay(true); S.acc -= 1; steps++; }
      if (S.acc > 1) S.acc = 1;
      if (steps && S.rMax) checkRhythm();
    }
    pumpToasts();
    draw(dt);
    if (S.now - S.hudAt > 0.2) { S.hudAt = S.now; updateHud(); }
    if (S.now - S.readAt > 0.35) { S.readAt = S.now; updateReadouts(); expStatus(); }
  }, view);

  function checkRhythm() {
    if (MS.isDone('rhythm') || !S.lvTuned) return;
    var T = meadowPeriod();
    if (isFinite(T) && isFinite(S.lvT) && S.lvOn && Math.abs(S.lvT - T) / T <= 0.1) win('rhythm', 'the meadow cycles every ' + fmt(T / SEASON, 1) + ' seasons and the equations every ' + fmt(S.lvT / SEASON, 1) + '.');
  }

  // ---------- text readouts ----------
  function dateText() {
    var d = m.day, yr = Math.floor(d / YEAR) + 1;
    return m.p.seasons ? 'Day ' + d + ' · year ' + yr + ' · ' + SEASONS[m.season()] : 'Day ' + d + ' · season ' + (Math.floor(d / SEASON) + 1) + '<span class="eco-wide"> · no seasons</span>';
  }
  function updateHud() {
    if (!m) return;
    var R = m.rabbits.length, F = m.foxes.length;
    var h = '<b>' + dateText() + '</b>' + (S.paused ? ' <span class="eco-dim">· paused</span>' : '') + (m.winter > 0 ? ' · ❄️' : '') +
      '<br><span class="eco-r">● ' + R + ' rabbit' + (R === 1 ? '' : 's') + '</span> &nbsp;<span class="eco-f">● ' + F + ' fox' + (F === 1 ? '' : 'es') + '</span><span class="eco-wide"> &nbsp;<span class="eco-g">● grass ' + Math.round(m.grassMean() * 100) + '%</span></span>';
    $('eco-hud').innerHTML = h;
  }
  function seasonsText(days) { return fmt(days / SEASON, 1) + ' seasons'; }
  function updateReadouts() {
    if (!m) return;
    var R = m.rabbits.length, F = m.foxes.length;
    $('eco-r-day').textContent = dateText().replace(/<[^>]+>/g, '');
    $('eco-r-rab').textContent = R; $('eco-r-fox').textContent = F;
    $('eco-r-grass').textContent = Math.round(m.grassMean() * 100) + '%';
    $('eco-r-lag').textContent = S.lastLag === null ? '—' : seasonsText(S.lastLag) + ' after the rabbits’';
    var T = meadowPeriod();
    $('eco-r-per').textContent = $('eco-r-per2').textContent = isFinite(T) ? seasonsText(T) : 'waiting for 3 rabbit peaks';
    var tl = S.lastTal;
    $('eco-r-born').textContent = tl ? tl.rb + ' rabbits, ' + tl.fb + ' cubs' : 'after the first season';
    $('eco-r-died').textContent = tl ? tl.re + ' / ' + (tl.rs) + ' rabbits' : '—';
    $('eco-r-lvper').textContent = S.lvOn && isFinite(S.lvT) ? seasonsText(S.lvT) : '—';
    $('eco-r-lvsmall').textContent = seasonsText(EM.lv.smallPeriod(S.q));
  }

  // ---------- drawing helpers ----------
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function niceCeil(v) {
    var e = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1e-9)))), f = v / e, steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
    for (var i = 0; i < steps.length; i++) if (f <= steps[i] + 1e-9) return steps[i] * e;
    return 10 * e;
  }
  function font(px, w) { return (w || 600) + ' ' + px + 'px system-ui,-apple-system,"Segoe UI",sans-serif'; }

  function layout() {
    var w = K.w, h = K.h, p = 10, g = 10, L = {}, narrow = w < 600, top = narrow ? 52 : p;   // on phones the numbers sit in a strip above the meadow
    var fw = w - 2 * p, fh = fw / 1.6, maxH = narrow ? h * 0.36 : h * 0.6;
    if (fh > maxH) { fh = maxH; fw = fh * 1.6; }
    L.f = { x: Math.round((w - fw) / 2), y: top, w: fw, h: fh, cs: fw / FW };
    var gy = top + fh + g, gh = h - gy - p;
    if (!narrow) {
      var pw = Math.round(Math.min(gh * 1.2, (w - 2 * p - g) * 0.36));
      L.ts = { x: p, y: gy, w: w - 2 * p - g - pw, h: gh }; L.ph = { x: w - p - pw, y: gy, w: pw, h: gh };
    } else {
      var th = Math.round(gh * 0.53);
      L.ts = { x: p, y: gy, w: w - 2 * p, h: th }; L.ph = { x: p, y: gy + th + g, w: w - 2 * p, h: gh - th - g };
    }
    L.narrow = narrow;
    return L;
  }

  // ---------- sprites ----------
  var SPR = { key: '' };
  function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); c.fill(); }
  function rabbitArt(c) {
    c.fillStyle = 'rgba(0,0,0,.28)'; ell(c, 0.48, 0.74, 0.34, 0.06);
    c.fillStyle = '#b89c78'; ell(c, 0.67, 0.15, 0.05, 0.16, -0.3); ell(c, 0.77, 0.13, 0.05, 0.16, 0.12);
    c.fillStyle = '#f0b3c2'; ell(c, 0.67, 0.16, 0.022, 0.11, -0.3); ell(c, 0.77, 0.14, 0.022, 0.11, 0.12);
    c.fillStyle = '#c9ad88'; ell(c, 0.43, 0.5, 0.29, 0.2);
    c.fillStyle = '#d8c09e'; ell(c, 0.47, 0.56, 0.2, 0.12);
    c.fillStyle = '#d3b994'; ell(c, 0.74, 0.38, 0.15, 0.14);
    c.fillStyle = '#f7f2e8'; ell(c, 0.14, 0.45, 0.085, 0.085);
    c.fillStyle = '#a88c69'; ell(c, 0.53, 0.68, 0.13, 0.05);
    c.fillStyle = '#251a12'; ell(c, 0.8, 0.35, 0.03, 0.032);
    c.fillStyle = '#e48aa0'; ell(c, 0.885, 0.41, 0.022, 0.018);
  }
  function foxArt(c) {
    c.fillStyle = 'rgba(0,0,0,.28)'; ell(c, 0.52, 0.88, 0.38, 0.06);
    c.fillStyle = '#3a2a22'; [0.36, 0.43, 0.64, 0.71].forEach(function (x) { c.fillRect(x, 0.58, 0.04, 0.27); });
    c.fillStyle = '#e8752d'; c.beginPath(); c.moveTo(0.33, 0.44); c.quadraticCurveTo(0.1, 0.36, 0.02, 0.62); c.quadraticCurveTo(0.16, 0.7, 0.36, 0.58); c.closePath(); c.fill();
    c.fillStyle = '#fff6ea'; ell(c, 0.06, 0.6, 0.06, 0.05, 0.4);
    c.fillStyle = '#f08a3c'; ell(c, 0.53, 0.5, 0.25, 0.14);
    c.fillStyle = '#fff3e3'; ell(c, 0.73, 0.57, 0.07, 0.07);
    c.fillStyle = '#d9662a'; c.beginPath(); c.moveTo(0.7, 0.3); c.lineTo(0.73, 0.1); c.lineTo(0.79, 0.28); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0.78, 0.28); c.lineTo(0.84, 0.09); c.lineTo(0.87, 0.3); c.closePath(); c.fill();
    c.fillStyle = '#f08a3c'; ell(c, 0.79, 0.36, 0.11, 0.1);
    c.fillStyle = '#f6a35f'; c.beginPath(); c.moveTo(0.84, 0.31); c.lineTo(0.99, 0.42); c.lineTo(0.84, 0.46); c.closePath(); c.fill();
    c.fillStyle = '#fff3e3'; ell(c, 0.85, 0.44, 0.06, 0.035);
    c.fillStyle = '#1d1410'; ell(c, 0.98, 0.415, 0.02, 0.018); ell(c, 0.835, 0.33, 0.018, 0.02);
  }
  function makeSprite(art, w, h, flip, dpr) {
    var c = document.createElement('canvas'); c.width = Math.ceil(w * dpr); c.height = Math.ceil(h * dpr);
    var g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (flip) { g.translate(w, 0); g.scale(-1, 1); }
    g.scale(w, w); art(g); return c;
  }
  function sprites(cs) {
    var rw = Math.max(12, cs * 1.7), fw = Math.max(18, cs * 2.6), dpr = K.dpr, key = rw.toFixed(1) + '|' + fw.toFixed(1) + '|' + dpr;
    if (SPR.key === key) return SPR;
    SPR = { key: key, rw: rw, rh: rw * 0.8, fw: fw, fh: fw * 0.95 };
    SPR.r = [makeSprite(rabbitArt, rw, rw * 0.8, false, dpr), makeSprite(rabbitArt, rw, rw * 0.8, true, dpr)];
    SPR.f = [makeSprite(foxArt, fw, fw * 0.95, false, dpr), makeSprite(foxArt, fw, fw * 0.95, true, dpr)];
    return SPR;
  }

  // ---------- the meadow ----------
  // the grass is painted one pixel per patch (with a border of copies), blurred into a soft meadow, then tufted;
  // this picture is cached and repainted a few times a second
  var GW2 = FW + 2, GH2 = FH + 2;
  var gcv = document.createElement('canvas'); gcv.width = GW2; gcv.height = GH2;
  var gctx = gcv.getContext('2d'), gimg = gctx.createImageData(GW2, GH2);
  var noise = new Float32Array(FW * FH), jit = new Float32Array(FW * FH * 4);
  (function () { var r = EM.rng(77); for (var i = 0; i < noise.length; i++) noise[i] = r() * 2 - 1; for (i = 0; i < jit.length; i++) jit[i] = r(); })();
  var mcv = document.createElement('canvas'), mctx = mcv.getContext('2d'), meadowKey = '';
  function frost() { if (!m.p.seasons) return 0; return clamp((1.1 - EM.seasonFactor(m.day)) / 0.4, 0, 1); }
  function paintGrass() {
    var G = m.grass, d = gimg.data, fr = frost() * 0.35 + (m.winter > 0 ? 0.3 : 0);
    for (var py = 0, j = 0; py < GH2; py++) for (var px = 0; px < GW2; px++, j += 4) {
      var i = clamp(py - 1, 0, FH - 1) * FW + clamp(px - 1, 0, FW - 1);
      var g = G[i], n = noise[i] * 0.05, r, gg, b, u;
      if (g < 0.35) { u = g / 0.35; r = 74 + (112 - 74) * u; gg = 56 + (118 - 56) * u; b = 34 + (52 - 34) * u; }
      else if (g < 0.75) { u = (g - 0.35) / 0.4; r = 112 + (60 - 112) * u; gg = 118 + (150 - 118) * u; b = 52 + (66 - 52) * u; }
      else { u = (g - 0.75) / 0.25; r = 60 + (40 - 60) * u; gg = 150 + (136 - 150) * u; b = 66 + (70 - 66) * u; }
      r *= 1 + n; gg *= 1 + n; b *= 1 + n;
      if (fr > 0) { r += (214 - r) * fr; gg += (228 - gg) * fr; b += (238 - b) * fr; }
      d[j] = r; d[j + 1] = gg; d[j + 2] = b; d[j + 3] = 255;
    }
    gctx.putImageData(gimg, 0, 0);
  }
  function paintMeadow(f) {
    var dpr = K.dpr, w = Math.ceil(f.w * dpr), h = Math.ceil(f.h * dpr), cs = f.cs, G = m.grass, c = mctx;
    if (mcv.width !== w || mcv.height !== h) { mcv.width = w; mcv.height = h; }
    paintGrass();
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, f.w, f.h);
    c.imageSmoothingEnabled = true;
    c.filter = 'blur(' + (cs * 0.4).toFixed(1) + 'px)';
    c.drawImage(gcv, -cs, -cs, f.w + 2 * cs, f.h + 2 * cs);
    c.filter = 'none';
    // tufts, taller where the grass is taller
    c.lineCap = 'round'; c.lineWidth = Math.max(0.8, cs * 0.09);
    var dark = new Path2D(), light = new Path2D();
    for (var i = 0; i < G.length; i++) {
      var g = G[i]; if (g < 0.45) continue;
      var x0 = (i % FW) * cs, y0 = ((i / FW) | 0) * cs, hgt = cs * (0.15 + 0.45 * (g - 0.45) / 0.55);
      for (var k = 0; k < 2; k++) {
        var x = x0 + jit[i * 4 + k * 2] * cs, y = y0 + jit[i * 4 + k * 2 + 1] * cs, P = k ? light : dark;
        P.moveTo(x, y); P.lineTo(x - hgt * 0.25, y - hgt); P.moveTo(x, y); P.lineTo(x + hgt * 0.3, y - hgt * 0.9);
      }
    }
    c.strokeStyle = 'rgba(20,70,35,.5)'; c.stroke(dark);
    c.strokeStyle = 'rgba(150,215,120,.38)'; c.stroke(light);
  }
  function makeFlakes() { S.flakes = []; if (reduced) return; for (var i = 0; i < 70; i++) S.flakes.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), v: 0.04 + Math.random() * 0.05 }); }

  function drawField(f) {
    var c = ctx, cs = f.cs;
    c.save(); rr(c, f.x, f.y, f.w, f.h, 10); c.clip();
    var key = f.w + '|' + f.h + '|' + K.dpr + '|' + m.day + '|' + m.seed;
    if (key !== meadowKey && (S.now - S.tuftAt > 0.12 || meadowKey.split('|')[0] !== String(f.w))) { S.tuftAt = S.now; meadowKey = key; paintMeadow(f); }
    c.drawImage(mcv, f.x, f.y, f.w, f.h);
    // the refuge and its fence
    var xr = m.fence();
    if (xr > 0) {
      var X = f.x + xr * cs;
      c.fillStyle = 'rgba(255,236,190,.1)'; c.fillRect(f.x, f.y, xr * cs, f.h);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(X + 1, f.y, Math.max(2, cs * 0.18), f.h);
      c.fillStyle = '#9a7652'; c.fillRect(X - cs * 0.12, f.y, Math.max(2, cs * 0.24), f.h);
      c.fillStyle = '#6e5238';
      for (var y = f.y + cs * 0.6; y < f.y + f.h; y += cs * 1.6) { c.fillRect(X - cs * 0.24, y, cs * 0.48, cs * 0.48); }
      c.font = font(Math.max(10, Math.min(12, cs)), 700); c.textAlign = 'left'; c.textBaseline = 'bottom';
      var tw = c.measureText('REFUGE').width;
      if (xr * cs > tw + 14) { c.fillStyle = 'rgba(6,17,26,.55)'; rr(c, f.x + 6, f.y + f.h - 22, tw + 10, 16, 6); c.fill(); c.fillStyle = '#ffe8b0'; c.fillText('REFUGE', f.x + 11, f.y + f.h - 9); }
    }
    // animals
    var sp = sprites(cs), a = S.acc, t = S.now, i, o;
    var R = m.rabbits, F = m.foxes;
    for (i = 0; i < R.length; i++) {
      o = R[i];
      var x = f.x + (o.px + (o.x - o.px) * a) * cs, y = f.y + (o.py + (o.y - o.py) * a) * cs;
      var sc = o.age >= RAB.mature ? 1 : 0.55 + 0.45 * o.age / RAB.mature, w = sp.rw * sc, h = sp.rh * sc;
      var mv = Math.abs(o.x - o.px) + Math.abs(o.y - o.py), bob = reduced ? 0 : Math.abs(Math.sin(t * 9 + o.hop * 6.28)) * Math.min(1, mv / 0.5) * h * 0.35;
      c.drawImage(sp.r[Math.cos(o.a) < 0 ? 1 : 0], x - w / 2, y - h * 0.75 - bob, w, h);
    }
    for (i = 0; i < F.length; i++) {
      o = F[i];
      x = f.x + (o.px + (o.x - o.px) * a) * cs; y = f.y + (o.py + (o.y - o.py) * a) * cs;
      sc = o.age >= FOX.mature ? 1 : 0.55 + 0.45 * o.age / FOX.mature; w = sp.fw * sc; h = sp.fh * sc;
      bob = reduced ? 0 : Math.abs(Math.sin(t * 7 + o.hop * 6.28)) * h * 0.04;
      c.drawImage(sp.f[Math.cos(o.a) < 0 ? 1 : 0], x - w / 2, y - h * 0.85 - bob, w, h);
    }
    drawFx(f);
    // snow during a hard winter
    if (m.winter > 0 && S.flakes.length) {
      c.fillStyle = 'rgba(255,255,255,.85)';
      for (i = 0; i < S.flakes.length; i++) {
        var fl = S.flakes[i]; fl.y += fl.v * 0.016; if (fl.y > 1) fl.y -= 1;
        c.beginPath(); c.arc(f.x + (fl.x + 0.02 * Math.sin(t + i)) % 1 * f.w, f.y + fl.y * f.h, fl.s * Math.max(1.2, cs * 0.13), 0, 7); c.fill();
      }
    }
    drawSelection(f);
    c.restore();
    c.strokeStyle = 'rgba(160,210,190,.25)'; c.lineWidth = 1; rr(c, f.x + 0.5, f.y + 0.5, f.w - 1, f.h - 1, 10); c.stroke();
    if (S.paused) {
      c.font = font(13, 700); var pw = c.measureText('Paused').width + 20;
      c.fillStyle = 'rgba(6,17,26,.7)'; rr(c, f.x + f.w / 2 - pw / 2, f.y + f.h / 2 - 14, pw, 28, 8); c.fill();
      c.fillStyle = C.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Paused', f.x + f.w / 2, f.y + f.h / 2);
    }
  }
  function drawFx(f) {
    var c = ctx, cs = f.cs, keep = [];
    for (var i = 0; i < S.fx.length; i++) {
      var e = S.fx[i], age = S.now - e.t, x = f.x + e.x * cs, y = f.y + e.y * cs, life = e.k === 'catch' ? 0.8 : e.k === 'miss' ? 0.45 : 0.9;
      if (age > life) continue; keep.push(e);
      var u = age / life, al = 1 - u;
      if (e.k === 'catch') {
        c.strokeStyle = 'rgba(249,168,212,' + al * 0.75 + ')'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y - cs * 0.3, cs * (0.3 + (reduced ? 0.4 : 0.8 * u)), 0, 7); c.stroke();
        c.fillStyle = 'rgba(255,240,245,' + al * 0.85 + ')';
        for (var k = 0; k < 5; k++) { var an = k * 1.257 + e.x, rr2 = cs * (0.25 + (reduced ? 0.25 : 0.7 * u)); c.beginPath(); c.arc(x + Math.cos(an) * rr2, y - cs * 0.3 + Math.sin(an) * rr2, Math.max(1, cs * 0.08), 0, 7); c.fill(); }
      } else if (e.k === 'miss') {
        c.fillStyle = 'rgba(230,220,200,' + al * 0.6 + ')'; c.beginPath(); c.arc(x, y, cs * (0.3 + 0.5 * u), 0, 7); c.fill();
      } else if (e.k === 'rb' || e.k === 'fb') {
        c.fillStyle = e.k === 'rb' ? 'rgba(99,230,190,' + al + ')' : 'rgba(255,212,121,' + al + ')';
        var rise = reduced ? 0 : u * cs * 1.2, s = Math.max(1.6, cs * (e.k === 'fb' ? 0.22 : 0.15));
        for (k = 0; k < 3; k++) { var sx = x + (k - 1) * cs * 0.45, sy = y - cs * 0.8 - rise - (k === 1 ? cs * 0.25 : 0); star(c, sx, sy, s); }
      } else if (e.k === 'sick') {
        c.fillStyle = 'rgba(190,170,220,' + al * 0.7 + ')'; c.beginPath(); c.arc(x, y - cs * 0.3, cs * (0.35 + 0.4 * u), 0, 7); c.fill();
      } else {
        c.fillStyle = 'rgba(200,210,220,' + al * 0.45 + ')'; c.beginPath(); c.arc(x, y - cs * 0.2, Math.max(1.5, cs * 0.18), 0, 7); c.fill();
      }
    }
    S.fx = keep;
  }
  function star(c, x, y, s) { c.beginPath(); c.moveTo(x, y - s); c.lineTo(x + s * 0.3, y - s * 0.3); c.lineTo(x + s, y); c.lineTo(x + s * 0.3, y + s * 0.3); c.lineTo(x, y + s); c.lineTo(x - s * 0.3, y + s * 0.3); c.lineTo(x - s, y); c.lineTo(x - s * 0.3, y - s * 0.3); c.closePath(); c.fill(); }

  // the animal you tapped, with a little card
  function drawSelection(f) {
    var o = S.sel; if (!o) return;
    var c = ctx, cs = f.cs, isFox = !!o.fox, a = S.acc;
    var x = f.x + (o.px + (o.x - o.px) * (o.dead ? 1 : a)) * cs, y = f.y + (o.py + (o.y - o.py) * (o.dead ? 1 : a)) * cs;
    var lines;
    if (o.dead) {
      if (S.now - S.selGoneAt > 3) { S.sel = null; return; }
      lines = [isFox ? 'This fox ' + ({ starved: 'starved.', old: 'died of old age.' }[o.cause] || 'died.') : 'This rabbit ' + ({ eaten: 'was caught by a fox.', starved: 'starved.', old: 'died of old age.', sick: 'died of the disease.' }[o.cause] || 'died.')];
    } else {
      var sp = isFox ? FOX : RAB, young = o.age < sp.mature, ageTxt = o.age < YEAR ? Math.round(o.age) + ' days old' : fmt(o.age / YEAR, 1) + ' years old';
      var st = '';
      if (!isFox && o.x < m.fence()) st = 'safe in the refuge';
      else if (isFox && o.e >= FOX.emax * FOX.full) st = 'full, not hunting';
      else if (o.e < sp.emax * 0.25) st = 'hungry';
      else if (!young && o.e > sp.emax * sp.breed) st = 'well fed';
      lines = [(isFox ? (young ? 'Fox cub' : 'Fox') : (young ? 'Young rabbit' : 'Rabbit')) + ', ' + ageTxt, 'energy ' + Math.max(0, Math.round(o.e)) + ' of ' + sp.emax + ' days' + (st ? ' · ' + st : '')];
    }
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5; c.setLineDash([3, 3]);
    c.beginPath(); c.arc(x, y - cs * 0.35, Math.max(9, cs * (isFox ? 1.5 : 1.05)), 0, 7); c.stroke(); c.setLineDash([]);
    c.font = font(11.5, 600); var tw = 0; lines.forEach(function (s) { tw = Math.max(tw, c.measureText(s).width); });
    var bw = tw + 16, bh = 10 + lines.length * 15, bx = clamp(x + 14, f.x + 4, f.x + f.w - bw - 4), by = clamp(y - bh - 18, f.y + 4, f.y + f.h - bh - 4);
    c.fillStyle = 'rgba(6,17,26,.86)'; rr(c, bx, by, bw, bh, 7); c.fill(); c.strokeStyle = isFox ? 'rgba(255,135,135,.6)' : 'rgba(255,212,121,.6)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = C.ink; c.textAlign = 'left'; c.textBaseline = 'top';
    lines.forEach(function (s, i) { c.fillText(s, bx + 8, by + 6 + i * 15); });
  }

  // ---------- the graphs ----------
  function firstIndex(t0) { var lo = 0, hi = HS.n; while (lo < hi) { var mid = (lo + hi) >> 1; if (HS.t[mid] < t0) lo = mid + 1; else hi = mid; } return lo; }
  function updateScales(dt) {
    var t0 = Math.max(m.day, WIN) - WIN, i0 = firstIndex(t0), rm = 0, fm = 0;
    for (var i = i0; i < HS.n; i++) {
      if (HS.R[i] > rm) rm = HS.R[i]; if (HS.F[i] > fm) fm = HS.F[i];
      if (HS.LR[i] > rm) rm = HS.LR[i]; if (HS.LF[i] > fm) fm = HS.LF[i];
    }
    if (S.lvOn) for (i = 0; i < S.orbit.length; i += 2) { if (S.orbit[i] > rm) rm = S.orbit[i]; if (S.orbit[i + 1] > fm) fm = S.orbit[i + 1]; }
    rm = Math.max(rm, m.rabbits.length, knobs.Rs * 1.15, 50); fm = Math.max(fm, m.foxes.length, knobs.Fs * 1.15, 5);
    var tr = niceCeil(rm * 1.08), tf = niceCeil(fm * 1.1), k = Math.min(1, dt * 4);
    S.rMax += (tr - S.rMax) * k; S.fMax += (tf - S.fMax) * k;
  }
  function seriesPath(c, A, t0, key, max, i0) {
    var started = false, arr = HS[key];
    c.beginPath();
    for (var i = i0; i < HS.n; i++) {
      var v = arr[i]; if (!isFinite(v)) { started = false; continue; }
      var x = A.x + (HS.t[i] - t0) / WIN * A.w, y = A.y + A.h - Math.min(1.04, v / max) * A.h;
      if (!started) { c.moveTo(x, y); started = true; } else c.lineTo(x, y);
    }
  }
  function strokeGlow(c, color, width, dash) {
    c.setLineDash(dash || []);
    c.globalAlpha = 0.22; c.strokeStyle = color; c.lineWidth = width + 3; c.stroke();
    c.globalAlpha = 1; c.lineWidth = width; c.stroke(); c.setLineDash([]);
  }
  function panelBox(b, title, sub) {
    var c = ctx; c.fillStyle = C.panel; rr(c, b.x, b.y, b.w, b.h, 10); c.fill();
    c.strokeStyle = 'rgba(120,170,200,.18)'; c.lineWidth = 1; rr(c, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 10); c.stroke();
  }
  function label(c, s, x, y, color, align, size, weight) { c.fillStyle = color; c.textAlign = align || 'left'; c.font = font(size || 10.5, weight); c.fillText(s, x, y); }
  function yTicks(max, h) {
    var raw = max / (h < 90 ? 2.2 : h < 140 ? 3 : 4), e = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / e, step = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * e, out = [];
    for (var v = step; v < max * 0.999; v += step) out.push(v); return out;
  }

  function drawSeries(b, dt) {
    var c = ctx; panelBox(b);
    var tEnd = Math.max(m.day, WIN), t0 = tEnd - WIN, i0 = firstIndex(t0 - SAMPLE);
    var padL = 32, padR = 30, head = 17, gap = 20, foot = 16;
    var ch = Math.max(30, (b.h - head - gap - foot - 8) / 2);
    var A = { x: b.x + padL, y: b.y + head, w: b.w - padL - padR, h: ch }, B = { x: A.x, y: A.y + ch + gap, w: A.w, h: ch };
    var rM = S.rMax, fM = S.fMax;
    c.textBaseline = 'alphabetic';
    [A, B].forEach(function (P, j) {
      c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(P.x, P.y, P.w, P.h);
      c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath();
      yTicks(rM, P.h).forEach(function (v) { var y = Math.round(P.y + P.h - v / rM * P.h) + 0.5; c.moveTo(P.x, y); c.lineTo(P.x + P.w, y); });
      c.stroke();
      c.textBaseline = 'middle';
      yTicks(rM, P.h).forEach(function (v) { label(c, String(Math.round(v)), P.x - 4, P.y + P.h - v / rM * P.h, 'rgba(255,212,121,.85)', 'right', 9.5, 500); });
      yTicks(fM, P.h).forEach(function (v) { label(c, String(Math.round(v)), P.x + P.w + 4, P.y + P.h - v / fM * P.h, 'rgba(255,135,135,.9)', 'left', 9.5, 500); });
      c.textBaseline = 'alphabetic';
      // years
      c.strokeStyle = 'rgba(120,170,200,.12)'; c.beginPath();
      for (var yr = Math.ceil(t0 / YEAR) * YEAR; yr <= tEnd; yr += YEAR) { var x = Math.round(P.x + (yr - t0) / WIN * P.w) + 0.5; c.moveTo(x, P.y); c.lineTo(x, P.y + P.h); }
      c.stroke();
    });
    var every = A.w < 330 ? 2 : 1;
    for (var yr = Math.ceil(t0 / YEAR) * YEAR; yr <= tEnd; yr += YEAR) {
      var n = yr / YEAR; if (n % every) continue;
      label(c, n === 0 ? 'start' : 'yr ' + n, A.x + (yr - t0) / WIN * A.w, B.y + B.h + 12, C.muted, 'center', 9.5, 500);
    }
    // meadow
    label(c, 'MEADOW', A.x, A.y - 5, C.ink, 'left', 10, 700);
    var lx = A.x + 56; label(c, 'rabbits', lx, A.y - 5, C.gold, 'left', 10, 600); lx += 44; label(c, 'foxes', lx, A.y - 5, C.red, 'left', 10, 600); lx += 36; if (lx + 30 < A.x + A.w) label(c, 'grass', lx, A.y - 5, C.green, 'left', 10, 600);
    c.save(); c.beginPath(); c.rect(A.x, A.y - 4, A.w, A.h + 4); c.clip();
    // grass as a shaded area from 0 to 100% of the height
    seriesPath(c, A, t0, 'G', 1, i0);
    var last = HS.n - 1;
    if (last >= i0) {
      c.lineTo(A.x + (HS.t[last] - t0) / WIN * A.w, A.y + A.h); c.lineTo(A.x + (HS.t[i0] - t0) / WIN * A.w, A.y + A.h); c.closePath();
      c.fillStyle = 'rgba(99,230,190,.1)'; c.fill();
    }
    seriesPath(c, A, t0, 'R', rM, i0); strokeGlow(c, C.gold, 1.6);
    seriesPath(c, A, t0, 'F', fM, i0); strokeGlow(c, C.red, 1.6);
    // peaks, and the time from a rabbit peak to the fox peak after it
    S.pkR.peaks.forEach(function (p) { if (p.t >= t0) tri(c, A.x + (p.t - t0) / WIN * A.w, A.y + A.h - Math.min(1, p.v / rM) * A.h - 5, C.gold); });
    S.pkF.peaks.forEach(function (p) { if (p.t >= t0) tri(c, A.x + (p.t - t0) / WIN * A.w, A.y + A.h - Math.min(1, p.v / fM) * A.h - 5, C.red); });
    S.pairs.slice(-4).forEach(function (p) {
      if (p.tf < t0) return;
      var x1 = A.x + (Math.max(p.tr, t0) - t0) / WIN * A.w, x2 = A.x + (p.tf - t0) / WIN * A.w, y = A.y + 5;
      c.strokeStyle = 'rgba(249,168,212,.85)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x1, y + 3); c.lineTo(x1, y); c.lineTo(x2, y); c.lineTo(x2, y + 3); c.stroke();
      if (x2 - x1 > 30) { c.textBaseline = 'top'; label(c, '+' + fmt((p.tf - p.tr) / SEASON, 1), (x1 + x2) / 2, y + 2, C.pink, 'center', 9.5, 600); c.textBaseline = 'alphabetic'; }
    });
    c.restore();
    // equations
    label(c, 'EQUATIONS', B.x, B.y - 5, C.ink, 'left', 10, 700);
    label(c, 'Lotka–Volterra, dashed', B.x + 70, B.y - 5, C.muted, 'left', 10, 500);
    c.save(); c.beginPath(); c.rect(B.x, B.y - 4, B.w, B.h + 4); c.clip();
    seriesPath(c, B, t0, 'LR', rM, i0); strokeGlow(c, C.gold, 1.6, [6, 3]);
    seriesPath(c, B, t0, 'LF', fM, i0); strokeGlow(c, C.red, 1.6, [6, 3]);
    c.restore();
    if (!S.lvOn) { c.textBaseline = 'middle'; label(c, 'The equations need both rabbits and foxes.', B.x + B.w / 2, B.y + B.h / 2, C.muted, 'center', 11, 500); c.textBaseline = 'alphabetic'; }
    // now
    var xn = A.x + (m.day + S.acc - t0) / WIN * A.w;
    if (xn < A.x + A.w - 1) { c.strokeStyle = 'rgba(219,231,239,.35)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(xn, A.y); c.lineTo(xn, B.y + B.h); c.stroke(); c.setLineDash([]); }
  }
  function tri(c, x, y, color) { c.fillStyle = color; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y - 6); c.lineTo(x + 4, y - 6); c.closePath(); c.fill(); }

  function drawPhase(b) {
    var c = ctx; panelBox(b);
    var P = { x: b.x + 32, y: b.y + 20, w: b.w - 44, h: b.h - 40 }, rM = S.rMax, fM = S.fMax;
    function px(R) { return P.x + Math.min(1.03, R / rM) * P.w; }
    function py(F) { return P.y + P.h - Math.min(1.03, F / fM) * P.h; }
    c.textBaseline = 'alphabetic';
    label(c, 'PHASE PLOT', b.x + 10, b.y + 14, C.ink, 'left', 10, 700);
    label(c, 'foxes vs. rabbits', b.x + 82, b.y + 14, C.muted, 'left', 10, 500);
    c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(P.x, P.y, P.w, P.h);
    c.strokeStyle = C.line; c.lineWidth = 1; c.beginPath();
    var rt = yTicks(rM, P.w), ft = yTicks(fM, P.h);
    rt.forEach(function (v) { var x = Math.round(px(v)) + 0.5; c.moveTo(x, P.y); c.lineTo(x, P.y + P.h); });
    ft.forEach(function (v) { var y = Math.round(py(v)) + 0.5; c.moveTo(P.x, y); c.lineTo(P.x + P.w, y); });
    c.stroke();
    c.textBaseline = 'top'; rt.forEach(function (v) { label(c, String(Math.round(v)), px(v), P.y + P.h + 3, 'rgba(255,212,121,.85)', 'center', 9.5, 500); });
    c.textBaseline = 'middle'; ft.forEach(function (v) { label(c, String(Math.round(v)), P.x - 4, py(v), 'rgba(255,135,135,.9)', 'right', 9.5, 500); });
    c.textBaseline = 'alphabetic';
    label(c, 'rabbits →', P.x + P.w, P.y + P.h - 4, C.gold, 'right', 10, 600);
    c.save(); c.translate(P.x + 11, P.y + 4); c.rotate(-Math.PI / 2); label(c, 'foxes →', 0, 0, C.red, 'right', 10, 600); c.restore();
    c.save(); c.beginPath(); c.rect(P.x, P.y, P.w, P.h); c.clip();
    // the equations' loop and balance point
    if (S.lvOn && S.orbit.length > 4) {
      c.beginPath(); for (var i = 0; i < S.orbit.length; i += 2) { var X = px(S.orbit[i]), Y = py(S.orbit[i + 1]); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }
      strokeGlow(c, C.blue, 1.3, [5, 4]);
      c.fillStyle = C.blue; c.beginPath(); c.arc(px(S.lv[0]), py(S.lv[1]), 3.5, 0, 7); c.fill();
    }
    var bx = px(knobs.Rs), by = py(knobs.Fs);
    c.strokeStyle = 'rgba(116,192,252,.8)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(bx - 5, by); c.lineTo(bx + 5, by); c.moveTo(bx, by - 5); c.lineTo(bx, by + 5); c.stroke();
    label(c, 'balance', bx - 4, by - 4, 'rgba(116,192,252,.85)', 'right', 9.5, 500);
    // the meadow's path, fading into the past
    var i0 = firstIndex(m.day - TRAIL), n = HS.n - i0;
    if (n > 1) {
      c.lineWidth = 1.6; c.lineJoin = 'round';
      var chunks = 8, per = Math.ceil(n / chunks);
      for (var k = 0; k < chunks; k++) {
        var a0 = i0 + k * per, a1 = Math.min(HS.n - 1, a0 + per); if (a0 >= a1) continue;
        c.strokeStyle = 'rgba(249,168,212,' + (0.12 + 0.88 * (k + 1) / chunks) + ')';
        c.beginPath(); c.moveTo(px(HS.R[a0]), py(HS.F[a0])); for (i = a0 + 1; i <= a1; i++) c.lineTo(px(HS.R[i]), py(HS.F[i])); c.stroke();
      }
    }
    var cx = px(m.rabbits.length), cy = py(m.foxes.length);
    c.fillStyle = 'rgba(249,168,212,.25)'; c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 3.5, 0, 7); c.fill();
    c.restore();
    label(c, '↺', P.x + P.w - 4, P.y + 14, C.muted, 'right', 13, 600);
  }

  function draw(dt) {
    var c = ctx; if (!m) return;
    if (Math.abs(cv.clientWidth - K.w) > 1 || Math.abs(cv.clientHeight - K.h) > 1) K.fit();   // the box changed size without a window resize
    var L = S.L = layout();
    c.fillStyle = '#06111a'; c.fillRect(0, 0, K.w, K.h);
    updateScales(dt);
    drawField(L.f);
    drawSeries(L.ts, dt);
    drawPhase(L.ph);
  }

  // ---------- pointer and keys ----------
  cv.addEventListener('click', function (e) {
    var L = S.L; if (!L || !m) return;
    var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, f = L.f;
    if (x < f.x || x > f.x + f.w || y < f.y || y > f.y + f.h) return;
    var wx = (x - f.x) / f.cs, wy = (y - f.y) / f.cs;
    if (S.tap === 'rabbit') { addPair('rabbit', wx, wy); return; }
    if (S.tap === 'fox') {
      if (wx < m.fence() + 0.4) { say('Foxes can’t get past the fence. Drop them on the right side.'); return; }
      addPair('fox', wx, wy); return;
    }
    // look: the nearest animal to the tap (sprites are drawn a little above their feet)
    var best = null, bd = Math.pow(Math.max(1.6, 22 / f.cs), 2), lists = [[m.rabbits, false, 0.4], [m.foxes, true, 0.7]];
    lists.forEach(function (L2) {
      L2[0].forEach(function (o) { var dx = o.x - wx, dy = o.y - L2[2] - wy, d2 = dx * dx + dy * dy; if (d2 < bd) { bd = d2; best = o; best.fox = L2[1]; } });
    });
    S.sel = best; S.selGoneAt = 0;
  });
  cv.addEventListener('keydown', function (e) {
    var k = e.key, done = true;
    if (k === ' ' || k === 'Spacebar') togglePause();
    else if (k === '+' || k === '=') setSpeed(S.speedIx + 1);
    else if (k === '-' || k === '_') setSpeed(S.speedIx - 1);
    else if (k === 'r' || k === 'R') restart();
    else if (k === 'w' || k === 'W') sendEvent('winter');
    else if (k === 'v' || k === 'V') sendEvent('disease');
    else if (k === 'Escape') S.sel = null;
    else done = false;
    if (done) e.preventDefault();
  });

  // ---------- start ----------
  setSpeed(S.speedIx);
  loadScene('classic');
  $('eco-note').textContent = SCENES.classic.note;
})();
