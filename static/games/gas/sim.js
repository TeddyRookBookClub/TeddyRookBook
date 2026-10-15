/* Gas in a Box: the page. Draws the box, the gauges and the graphs on one canvas, runs the controls and the missions.
   The physics lives in physics.js (window.GasModel): lengths in nm, times in ps, masses in u. */
(function () {
  'use strict';
  var LAB = window.TRBLab, GM = window.GasModel;
  var root = document.getElementById('gas-lab');
  if (!root || !LAB || !GM) return;
  function $(id) { return document.getElementById(id); }
  var view = $('gas-view'), cv = $('gas-cv'), K = LAB.canvas(cv), ctx = K.c;
  var HE = 0, AR = 1, KB = GM.KB, ZJ = GM.ZJ, MNM = GM.MNM, MASS = [GM.SPECIES[0].m, GM.SPECIES[1].m];
  var g = GM.create({ seed: (Date.now() % 100000) + 1 });
  var PLAY = 10;                         // picoseconds of model time per second on screen, at 1×
  var SPEEDS = [0.25, 1, 3], SPEED_TXT = ['¼×', '1×', '3×'];
  var UMAX = 0.8;                        // piston speed, nm/ps: fast 800 m/s (a bit slower than a typical helium atom), or slow 100 m/s
  var SETTLE = 20, VALID = 30;           // ps to wait after a change, ps of averaging before a reading counts
  var C = { ink: '#dbe7ef', muted: '#8fb3c6', line: 'rgba(120,170,200,.25)', he: '#ffd479', ar: '#74c0fc', pink: '#f9a8d4', green: '#63e6be', red: '#ff8787', gold: '#ffd479', blue: '#74c0fc' };
  var ui = LAB.store('gas-ui');
  var fmt = LAB.fmt, reduced = LAB.reduced;

  var SCENES = {
    ideal: { he: 100, ar: 0, T: 300, thermo: true, div: false, note: 'Helium with thermostat walls at 300 K. Squeeze it, heat it, add atoms.' },
    spread: { he: 150, ar: 0, T: 300, thermo: false, div: false, same: true, note: 'Every atom starts at the same speed. The walls are insulated, so only collisions change the speeds.' },
    two: { he: 60, ar: 60, T: 300, thermo: true, div: true, note: 'Helium on the left, argon on the right, both at 300 K. Take out the divider to mix them.' },
    pump: { he: 120, ar: 0, T: 300, thermo: false, div: false, note: 'Insulated walls: no heat gets in or out. Push the piston down and watch the thermometer.' },
    crowd: { he: 100, ar: 200, T: 300, thermo: true, div: false, note: 'Three hundred atoms, mostly big argon ones. Squeeze them and compare P·A with N·k·T.' }
  };

  // ---------- state ----------
  var B = 30;                            // histogram bins
  var S = {
    scene: 'ideal', speedIx: 1, paused: false, colorBySpeed: !!ui.get('color', false),
    target: g.Hmax, Tset: 300, umax: UMAX, cfg: 0, nk: [0, 0],
    track: 0, trail: [], heavyAcc: [0, 0, 0, 0],
    Pfast: 0, Pslow: 0, Tema: 300, Tk: [300, 300], vk: [0, 0], ek: [0, 0],
    hist: [new Float64Array(B), new Float64Array(B)], vAxis: 2000, Pscale: 1, Tscale: 600, yMax: 0.1,
    pv: [], pvClock: 0, seg: null, segs: [],
    spreadArmed: false, spreadEma: [0, 0], mixArmed: false, mixHold: 0, heavyHold: 0, Tref: 300,
    vis: [], clock: 0, uiClock: 0, missionClock: 0, drag: null, hover: false, needle: 0, thermoFill: 0
  };
  var hitBuf = [];

  // ---------- controls ----------
  var el = {
    scenes: $('gas-scenes'), note: $('gas-scene-note'), nhe: $('gas-nhe'), nar: $('gas-nar'), nheO: $('gas-nhe-o'), narO: $('gas-nar-o'),
    temp: $('gas-temp'), tempO: $('gas-temp-o'), tempL: $('gas-temp-l'), tempNote: $('gas-temp-note'), thermo: $('gas-thermo'),
    vol: $('gas-vol'), volO: $('gas-vol-o'), div: $('gas-div'), color: $('gas-color'), hud: $('gas-hud'),
    pause: $('gas-pause'), speed: $('gas-speed'), reset: $('gas-reset'),
    rT: $('gas-r-t'), rP: $('gas-r-p'), rA: $('gas-r-a'), rPA: $('gas-r-pa'), rNKT: $('gas-r-nkt'), rAvg: $('gas-r-avg'), rRatio: $('gas-r-ratio'), rHe: $('gas-r-he'), rAr: $('gas-r-ar'), rW: $('gas-r-w'), rQ: $('gas-r-q')
  };

  var MISSIONS = [
    { id: 'heat', title: 'Hot means fast', goal: 'Raise the temperature to 600 K or more and watch the atoms speed up.' },
    { id: 'spread', title: 'From one speed to many', goal: 'Start every atom at the same speed and let collisions spread the speeds into the Maxwell–Boltzmann curve.' },
    { id: 'boyle', title: "Boyle's law", goal: 'With the thermostat on, let the pressure settle, then halve the volume and wait: the pressure doubles.' },
    { id: 'gay', title: "Gay-Lussac's law", goal: 'Keep the volume fixed and raise the temperature by half or more: the pressure rises by the same factor.' },
    { id: 'heavy', title: 'Heavy and slow', goal: 'Have helium and argon at the same temperature: argon moves about 3 times slower, with the same average energy.' },
    { id: 'mix', title: 'Mix two gases', goal: 'Start with helium and argon apart, take out the divider and wait until both fill the box evenly.' },
    { id: 'pump', title: 'Bike pump', goal: 'With insulated walls, raise the temperature by half just by pushing the piston.' },
    { id: 'real', title: 'Not so ideal', goal: 'Squeeze a crowded gas until its pressure is 30% above what the ideal-gas law predicts.' }
  ];
  var PICK = {
    heat: ['ideal', 'Drag the temperature up to 600 K or more.'],
    spread: ['spread', 'Watch the histogram: the spike spreads out into the curve.'],
    boyle: ['ideal', 'Wait a few seconds, then drag the piston down to 50% and wait again.'],
    gay: ['ideal', 'Wait a few seconds, then raise the temperature to 450 K or more and wait again.'],
    heavy: ['two', 'Compare the average speeds and energies in the panel.'],
    mix: ['two', 'Take out the divider and wait.'],
    pump: ['pump', 'Push the piston down until the temperature is up by half.'],
    real: ['crowd', 'Squeeze the gas to 40% or less, then wait.']
  };
  var MS = LAB.missions($('gas-missions'), 'gas', MISSIONS, function (id) { var p = PICK[id]; if (!p) return; loadScene(p[0]); toastQ = []; toastAt = -10; say(p[1]); });
  // toasts wait their turn, so two missions finished together both get seen
  var toastQ = [], toastAt = -10;
  function say(text) { toastQ.push(text); pumpToasts(); }
  function pumpToasts() { var now = performance.now() / 1000; if (toastQ.length && now - toastAt > 2.9) { toastAt = now; LAB.toast(view, toastQ.shift()); } }
  function win(id, text) { if (MS.done(id)) { var m = MISSIONS.filter(function (x) { return x.id === id; })[0]; say('✓ ' + m.title + ': ' + text); } }

  // ---------- scenes ----------
  function loadScene(id) {
    var sc = SCENES[id] || SCENES.ideal; S.scene = SCENES[id] ? id : 'ideal'; ui.set('scene', S.scene);
    g.clear(); g.H = g.Hmax; S.target = g.Hmax; g.thermo = sc.thermo; g.Twall = sc.T; S.Tset = sc.T; g.divider = sc.div;
    g.add(HE, sc.he, sc.T); g.add(AR, sc.ar, sc.T);
    if (sc.same) g.sameSpeed(sc.T); else g.setTemperature(sc.T);
    g.work = 0; g.heat = 0;
    S.spreadArmed = !!sc.same; S.spreadEma = [0, 0]; S.mixArmed = false; S.mixHold = 0; S.heavyHold = 0; S.heavyAcc = [0, 0, 0, 0];
    S.pv = []; S.segs = []; S.seg = null; S.vis = []; S.trail = []; S.track = 0;
    afterChange(true);
    var Tg = g.temperature(), Pi = g.n ? g.n * KB * Tg / g.area() * 1.03 : 0;
    S.Pfast = S.Pslow = Pi; S.Tema = Tg; S.Tk = [g.temperature(HE) || Tg, g.temperature(AR) || Tg]; S.Tref = Tg;
    S.hist[0].fill(0); S.hist[1].fill(0);
    S.Pscale = niceP(Pi * 1.3); S.Tscale = niceT(Tg);
    syncControls();
    var bs = el.scenes.querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i].getAttribute('data-scene') === S.scene ? 'true' : 'false');
    el.note.textContent = sc.note;
  }
  // after anything the visitor changes by hand (not the piston)
  function afterChange(keepRef) {
    S.cfg++; S.nk = [g.count(HE), g.count(AR)];
    if (!keepRef) S.Tref = g.temperature();
  }
  function syncControls() {
    el.nhe.value = S.nk[0]; el.nar.value = S.nk[1]; el.nheO.textContent = S.nk[0]; el.narO.textContent = S.nk[1];
    el.thermo.checked = g.thermo;
    el.temp.value = Math.round(g.thermo ? g.Twall : clamp(S.Tema, 100, 1000));
    el.vol.value = Math.round(S.target / g.Hmax * 100);
    el.div.textContent = g.divider ? 'Take out the divider' : 'Put in the divider';
    el.color.setAttribute('aria-pressed', S.colorBySpeed ? 'true' : 'false');
    tempLabels();
  }
  function tempLabels() {
    el.tempL.textContent = g.thermo ? 'Wall temperature' : 'Gas temperature';
    el.tempNote.textContent = g.thermo ? 'The walls heat or cool the gas until it matches their temperature.' : 'No heat gets in or out. The slider scales every atom’s speed, and the piston changes the temperature by doing work.';
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function setCount(k, v) {
    var cur = g.count(k);
    if (v > cur) { var T = g.thermo ? g.Twall : (g.n ? g.temperature() : S.Tset); g.add(k, v - cur, T); }
    else if (v < cur) g.remove(k, cur - v);
    S.spreadArmed = false; S.mixArmed = false; S.heavyHold = 0; S.heavyAcc = [0, 0, 0, 0];
    afterChange();
  }
  function setTemp(T) {
    T = clamp(T, 100, 1000); S.Tset = T; el.temp.value = T;
    if (g.thermo) g.Twall = T; else { g.setTemperature(T); S.Tema = g.temperature(); S.Tk = [g.temperature(HE) || S.Tema, g.temperature(AR) || S.Tema]; }
    afterChange();
    el.tempO.textContent = Math.round(g.thermo ? g.Twall : S.Tema) + ' K';
  }
  function setDivider(on) {
    if (on === g.divider) return;
    if (!on) {
      var f = sideFractions();
      S.mixArmed = S.nk[0] >= 20 && S.nk[1] >= 20 && ((f[0] >= 0.85 && f[1] <= 0.15) || (f[0] <= 0.15 && f[1] >= 0.85));
      S.mixHold = 0;
      g.setDivider(false);
      say(S.mixArmed ? 'Divider out. Watch the two gases mix.' : 'Divider out.');
    } else { g.setDivider(true); S.mixArmed = false; }
    afterChange(true);
    el.div.textContent = g.divider ? 'Take out the divider' : 'Put in the divider';
  }
  function sideFractions() {
    var l = [0, 0], n = [0, 0], half = g.W / 2;
    for (var i = 0; i < g.n; i++) { var k = g.kind[i]; n[k]++; if (g.x[i] < half) l[k]++; }
    return [n[0] ? l[0] / n[0] : 0.5, n[1] ? l[1] / n[1] : 0.5];
  }

  el.scenes.addEventListener('click', function (e) { var b = e.target.closest('button[data-scene]'); if (!b) return; loadScene(b.getAttribute('data-scene')); toastQ = []; toastAt = -10; say(SCENES[S.scene].note); });
  el.nhe.addEventListener('input', function () { setCount(HE, +el.nhe.value); el.nheO.textContent = S.nk[0]; });
  el.nar.addEventListener('input', function () { setCount(AR, +el.nar.value); el.narO.textContent = S.nk[1]; });
  el.temp.addEventListener('input', function () { setTemp(+el.temp.value); });
  el.thermo.addEventListener('change', function () {
    g.thermo = el.thermo.checked;
    if (g.thermo) { g.Twall = clamp(Math.round(S.Tema / 10) * 10, 100, 1000); el.temp.value = g.Twall; }
    afterChange(); tempLabels();
    say(g.thermo ? 'Thermostat walls on: the gas will settle at ' + g.Twall + ' K.' : 'Insulated walls: no heat in or out.');
  });
  el.vol.addEventListener('input', function () { S.target = clamp(+el.vol.value / 100 * g.Hmax, g.Hmin, g.Hmax); });
  el.div.addEventListener('click', function () { setDivider(!g.divider); });
  $('gas-pspeed').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-ps]'); if (!b) return; S.umax = +b.getAttribute('data-ps');
    var bs = this.querySelectorAll('button'); for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', bs[i] === b ? 'true' : 'false');
  });
  el.color.addEventListener('click', function () { S.colorBySpeed = !S.colorBySpeed; ui.set('color', S.colorBySpeed); el.color.setAttribute('aria-pressed', S.colorBySpeed ? 'true' : 'false'); });
  function setPaused(p) { S.paused = p; el.pause.textContent = p ? '▶' : '❚❚'; el.pause.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
  el.pause.addEventListener('click', function () { setPaused(!S.paused); });
  el.speed.addEventListener('click', function () { S.speedIx = (S.speedIx + 1) % SPEEDS.length; el.speed.textContent = SPEED_TXT[S.speedIx]; el.speed.setAttribute('aria-label', 'Playback speed: ' + SPEEDS[S.speedIx] + ' times'); });
  el.reset.addEventListener('click', function () { loadScene(S.scene); });

  // keyboard on the canvas
  cv.addEventListener('keydown', function (e) {
    var k = e.key, used = true;
    if (k === 'ArrowUp') S.target = clamp(S.target + 0.05 * g.Hmax, g.Hmin, g.Hmax);
    else if (k === 'ArrowDown') S.target = clamp(S.target - 0.05 * g.Hmax, g.Hmin, g.Hmax);
    else if (k === 'ArrowRight') setTemp((+el.temp.value) + 20);
    else if (k === 'ArrowLeft') setTemp((+el.temp.value) - 20);
    else if (k === ' ' || k === 'Spacebar') setPaused(!S.paused);
    else if (k === 'd' || k === 'D') setDivider(!g.divider);
    else used = false;
    if (used) { e.preventDefault(); el.vol.value = Math.round(S.target / g.Hmax * 100); }
  });

  // ---------- layout ----------
  var R = {};
  function layout() {
    var w = K.w, h = K.h; R.w = w; R.h = h; R.wide = w >= 600;
    var top = R.wide ? 58 : 70, rod = 34;
    if (R.wide) {
      var cw = Math.round(clamp(w * 0.32, 210, 300)), regionW = w - cw - 44, regionH = h - top - rod - 34;
      R.s = Math.min(regionW / g.W, regionH / g.Hmax);
      R.bw = g.W * R.s; R.bh = g.Hmax * R.s; R.bx = 20 + (regionW - R.bw) / 2; R.by = top + rod + R.bh + Math.max(0, (regionH - R.bh) / 2);
      var cx = w - cw - 14, gh = 118, rest = h - 58 - gh - 14 - 12 - 12, hh = Math.floor(rest / 2);
      R.gauge = { x: cx, y: 58, w: cw, h: gh };
      R.hist = { x: cx, y: 58 + gh + 12, w: cw, h: hh };
      R.pv = { x: cx, y: 58 + gh + 24 + hh, w: cw, h: rest - hh };
    } else {
      var chartH = Math.round(clamp(h * 0.33, 140, 200)), rW = w - 28, rH = h - top - rod - chartH - 40;
      R.s = Math.min(rW / g.W, rH / g.Hmax);
      R.bw = g.W * R.s; R.bh = g.Hmax * R.s; R.bx = (w - R.bw) / 2; R.by = top + rod + R.bh;
      var cwh = (w - 30) / 2;
      R.gauge = null;
      R.hist = { x: 10, y: h - chartH - 10, w: cwh, h: chartH };
      R.pv = { x: 20 + cwh, y: h - chartH - 10, w: cwh, h: chartH };
    }
    R.rod = rod;
  }
  function X(x) { return R.bx + x * R.s; }
  function Y(y) { return R.by - y * R.s; }

  // ---------- sprites (glowing atoms) ----------
  var sprites = {}, spriteKey = '';
  function sprite(color, r) {
    var key = color + '|' + r.toFixed(2);
    if (sprites[key]) return sprites[key];
    var dpr = K.dpr, halo = r * 2.6 + 2.5, size = Math.ceil(halo * 2 * dpr) + 2, c = document.createElement('canvas');
    c.width = c.height = size;
    var q = c.getContext('2d'), m = size / 2, rr = r * dpr, hh = halo * dpr;
    var gl = q.createRadialGradient(m, m, rr * 0.6, m, m, hh); gl.addColorStop(0, hexA(color, 0.42)); gl.addColorStop(1, hexA(color, 0));
    q.fillStyle = gl; q.beginPath(); q.arc(m, m, hh, 0, 7); q.fill();
    var core = q.createRadialGradient(m - rr * 0.35, m - rr * 0.35, rr * 0.1, m, m, rr);
    core.addColorStop(0, '#ffffff'); core.addColorStop(0.45, color); core.addColorStop(1, shade(color, 0.7));
    q.fillStyle = core; q.beginPath(); q.arc(m, m, Math.max(rr, 0.8 * dpr), 0, 7); q.fill();
    var o = { c: c, half: size / 2 / dpr, size: size / dpr };
    sprites[key] = o; return o;
  }
  function hexA(hex, a) { var n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function shade(hex, f) { var n = parseInt(hex.slice(1), 16); return 'rgb(' + Math.round((n >> 16) * f) + ',' + Math.round(((n >> 8) & 255) * f) + ',' + Math.round((n & 255) * f) + ')'; }
  function lerpHex(a, b, t) { var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); function ch(s) { return Math.round(((x >> s) & 255) + (((y >> s) & 255) - ((x >> s) & 255)) * t); } return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1); }
  function ramp(stops, v) {
    if (v <= stops[0][0]) return stops[0][1];
    for (var i = 1; i < stops.length; i++) if (v <= stops[i][0]) return lerpHex(stops[i - 1][1], stops[i][1], (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    return stops[stops.length - 1][1];
  }
  var T_RAMP = [[100, '#4dabf7'], [220, '#74c0fc'], [330, '#a9c4d4'], [600, '#ffa94d'], [1000, '#ff6b6b'], [2000, '#ff8fab']];
  var V_RAMP = [[0, '#4263eb'], [450, '#4dabf7'], [900, '#63e6be'], [1400, '#ffd479'], [1900, '#ffa94d'], [2500, '#ff6b6b']];
  var V_BUCKETS = []; for (var vb = 0; vb <= 12; vb++) V_BUCKETS.push(ramp(V_RAMP, vb * 225));

  // ---------- simulation step and measurements ----------
  function stepSim(dt) {
    var simDt = dt * PLAY * SPEEDS[S.speedIx];
    if (simDt <= 0) return;
    var u = 0, dH = S.target - g.H;
    if (Math.abs(dH) > 1e-9) u = clamp(dH / simDt, -S.umax, S.umax);
    var moving = u !== 0;
    hitBuf.length = 0; g.hits = reduced ? null : hitBuf;
    var imp0 = g.imp;
    var t0 = g.time; g.step(simDt, u); simDt = g.time - t0;
    if (Math.abs(S.target - g.H) < 1e-7) g.H = S.target;
    if (g.H < g.Hmin) g.H = g.Hmin; if (g.H > g.Hmax) g.H = g.Hmax;
    var dImp = g.imp - imp0, Pinst = dImp / simDt;
    var Tg = g.temperature(), n = g.n;
    // smoothing in model time
    var af = 1 - Math.exp(-simDt / 5), as = 1 - Math.exp(-simDt / 8), at = 1 - Math.exp(-simDt / 3), aT = g.thermo ? 1 - Math.exp(-simDt / 8) : 1, ak = 1 - Math.exp(-simDt / 4);
    S.Pfast += (Pinst - S.Pfast) * af; S.Pslow += (Pinst - S.Pslow) * as; S.Tema += (Tg - S.Tema) * aT;
    // per species: temperature, average speed and kinetic energy
    var cnt = [0, 0], ke = [0, 0], vs = [0, 0], i;
    var hInst = [new Float64Array(B), new Float64Array(B)], vA = S.vAxis / 1000;
    for (i = 0; i < n; i++) {
      var k = g.kind[i], v2 = g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i], v = Math.sqrt(v2);
      cnt[k]++; ke[k] += 0.5 * MASS[k] * v2; vs[k] += v;
      var b = Math.floor(v / vA * B); if (b < B) hInst[k][b]++;
    }
    for (k = 0; k < 2; k++) if (cnt[k]) {
      S.Tk[k] += (ke[k] / (cnt[k] * KB) - S.Tk[k]) * ak; S.vk[k] += (vs[k] / cnt[k] - S.vk[k]) * ak; S.ek[k] += (ke[k] / cnt[k] - S.ek[k]) * ak;
      for (b = 0; b < B; b++) S.hist[k][b] += (hInst[k][b] / cnt[k] - S.hist[k][b]) * at;
    }
    // the spread mission: fractions below ½ and above 1½ times the rms speed, for the more numerous kind
    var km = cnt[0] >= cnt[1] ? 0 : 1;
    if (cnt[km] > 0) {
      var vr = Math.sqrt(2 * ke[km] / cnt[km] / MASS[km]), lo = 0, hi = 0;
      for (i = 0; i < n; i++) if (g.kind[i] === km) { var sp = Math.sqrt(g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i]); if (sp < 0.5 * vr) lo++; else if (sp > 1.5 * vr) hi++; }
      S.spreadEma[0] += (lo / cnt[km] - S.spreadEma[0]) * at; S.spreadEma[1] += (hi / cnt[km] - S.spreadEma[1]) * at;
    }
    // steady stretches ("segments") for the pressure average and the gas-law missions
    var sig = S.cfg + '|' + g.H.toFixed(6) + '|' + (g.thermo ? g.Twall : 'ins');
    if (moving || !S.seg || S.seg.sig !== sig) {
      endSeg();
      S.seg = { sig: sig, age: 0, time: 0, imp: 0, Tsum: 0, A: g.area(), nk: S.nk.slice(), div: g.divider };
    }
    var sg = S.seg; sg.age += simDt;
    if (!moving && sg.age > SETTLE) { sg.time += simDt; sg.imp += dImp; sg.Tsum += Tg * simDt; }
    // missions that need time to pass
    if (cnt[0] >= 20 && cnt[1] >= 20) {   // running averages for the heavy-and-slow mission
      S.heavyHold += simDt; var hA = S.heavyAcc;
      hA[0] += vs[0] / cnt[0] * simDt; hA[1] += vs[1] / cnt[1] * simDt; hA[2] += ke[0] / cnt[0] * simDt; hA[3] += ke[1] / cnt[1] * simDt;
    } else { S.heavyHold = 0; S.heavyAcc = [0, 0, 0, 0]; }
    if (S.mixArmed && !g.divider) {
      var f = sideFractions();
      if (f[0] > 0.4 && f[0] < 0.6 && f[1] > 0.4 && f[1] < 0.6) S.mixHold += simDt; else S.mixHold = 0;
    }
    // things to draw
    if (!reduced) {
      for (i = 0; i + 2 < hitBuf.length; i += 3) S.vis.push({ w: hitBuf[i], s: hitBuf[i + 1], j: hitBuf[i + 2], t: S.clock });
      if (S.vis.length > 260) S.vis.splice(0, S.vis.length - 260);
    }
    var ti = trackIndex();
    if (ti >= 0) { S.trail.push(g.x[ti], g.y[ti]); if (S.trail.length > 2 * 420) S.trail.splice(0, 2); }
  }
  function endSeg() { var s = S.seg; if (s && s.time >= VALID) { S.segs.push({ A: s.A, P: s.imp / s.time, T: s.Tsum / s.time, nk: s.nk, div: s.div }); if (S.segs.length > 16) S.segs.shift(); } }
  function trackIndex() {
    if (!g.n) return -1;
    for (var i = 0; i < g.n; i++) if (g.tag[i] === S.track) return i;
    var j = Math.floor(g.rand() * g.n); S.track = g.tag[j]; S.trail = []; return j;
  }
  // current pressure reading: the steady average if there is one, otherwise the smoothed value
  function reading() {
    var s = S.seg, n = g.n;
    if (s && s.time >= 4) return { P: s.imp / s.time, T: s.Tsum / s.time, avg: s.time, A: s.A };
    return { P: S.Pslow, T: S.Tema, avg: 0, A: g.area() };
  }

  function checkMissions() {
    var n = g.n;
    if (n >= 10 && S.Tema >= 600) win('heat', 'at ' + Math.round(S.Tema) + ' K the atoms race around. Temperature is their average kinetic energy.');
    if (S.spreadArmed && S.spreadEma[0] >= 0.17 && S.spreadEma[1] >= 0.07) win('spread', 'collisions shared the energy out. Now a few atoms crawl and a few race.');
    var hA = S.heavyAcc;
    if (S.heavyHold >= 30 && hA[3] > 0 && Math.abs(hA[2] / hA[3] - 1) < 0.1) win('heavy', 'same average energy, but argon moves ' + fmt(hA[0] / hA[1], 2) + ' times slower than helium.');
    if (S.mixHold >= 6) win('mix', 'both gases now fill the box. They won’t unmix on their own.');
    if (!g.thermo && n >= 10 && S.Tema >= 1.5 * S.Tref) win('pump', 'the piston’s work heated the gas from ' + Math.round(S.Tref) + ' K to ' + Math.round(S.Tema) + ' K.');
    var cur = S.seg;
    if (!cur || cur.time < VALID || n < 10) return;
    var P2 = cur.imp / cur.time, T2 = cur.Tsum / cur.time;
    if (P2 * cur.A / (n * KB * T2) >= 1.3) win('real', 'the pressure is ' + Math.round((P2 * cur.A / (n * KB * T2) - 1) * 100) + '% above the ideal-gas law, because the atoms take up room.');
    for (var i = S.segs.length - 1; i >= 0; i--) {
      var o = S.segs[i];
      if (o.nk[0] !== cur.nk[0] || o.nk[1] !== cur.nk[1] || o.div !== cur.div) continue;
      var r = cur.A / o.A, p = P2 / o.P, tr = T2 / o.T;
      if (Math.abs(tr - 1) <= 0.08 && ((r >= 0.4 && r <= 0.6) || (r >= 1 / 0.6 && r <= 1 / 0.4)) && p * r >= 0.85 && p * r <= 1.2)
        win('boyle', (r < 1 ? 'half' : 'twice') + ' the volume, ' + fmt(p, 2) + ' times the pressure.');
      if (Math.abs(r - 1) <= 0.02 && (tr >= 1.4 || tr <= 1 / 1.4) && p / tr >= 0.88 && p / tr <= 1.12)
        win('gay', 'temperature × ' + fmt(tr, 2) + ', pressure × ' + fmt(p, 2) + '.');
    }
  }

  // ---------- drawing ----------
  function niceP(p) { var v = 0.5; while (v < p) v *= 2; return v; }
  function niceT(t) { var v = 600; while (v < t * 1.08) v *= 2; return v; }
  var V_AXES = [500, 750, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000];

  function draw() {
    layout();
    var key = R.s.toFixed(3) + '|' + K.dpr; if (key !== spriteKey) { sprites = {}; spriteKey = key; }
    var c = ctx, w = R.w, h = R.h;
    c.clearRect(0, 0, w, h);
    var bgG = c.createRadialGradient(w * 0.35, h * 0.45, 20, w * 0.35, h * 0.45, Math.max(w, h) * 0.8);
    bgG.addColorStop(0, '#0b1d2b'); bgG.addColorStop(1, '#06111a'); c.fillStyle = bgG; c.fillRect(0, 0, w, h);
    drawBox(c);
    if (R.gauge) drawGauges(c, R.gauge);
    drawHist(c, R.hist);
    drawPV(c, R.pv);
  }

  function drawBox(c) {
    var s = R.s, x0 = R.bx, x1 = R.bx + R.bw, yb = R.by, yTop = R.by - R.bh, yp = Y(g.H), ww = 7;
    // gas region
    var gg = c.createLinearGradient(0, yp, 0, yb); gg.addColorStop(0, 'rgba(116,192,252,.05)'); gg.addColorStop(1, 'rgba(99,230,190,.06)');
    c.fillStyle = gg; c.fillRect(x0, yp, R.bw, yb - yp);
    c.fillStyle = 'rgba(255,255,255,.015)'; c.fillRect(x0, yTop - 8, R.bw, yp - yTop + 8);
    // walls
    var hot = g.thermo, wc = hot ? ramp(T_RAMP, g.Twall) : '#3a5163';
    c.save();
    if (hot) { c.shadowColor = wc; c.shadowBlur = 6 + 10 * Math.min(1, Math.abs(g.Twall - 300) / 500); }
    c.fillStyle = wc;
    c.fillRect(x0 - ww, yTop - 10, ww, yb - yTop + 10 + ww); c.fillRect(x1, yTop - 10, ww, yb - yTop + 10 + ww); c.fillRect(x0 - ww, yb, R.bw + 2 * ww, ww);
    c.restore();
    if (!hot) { // insulation hatching
      c.save(); c.beginPath(); c.rect(x0 - ww, yTop - 10, ww, yb - yTop + 10 + ww); c.rect(x1, yTop - 10, ww, yb - yTop + 10 + ww); c.rect(x0 - ww, yb, R.bw + 2 * ww, ww); c.clip();
      c.strokeStyle = 'rgba(200,220,235,.28)'; c.lineWidth = 1; c.beginPath();
      for (var q = -R.bh - 40; q < R.bw + R.bh + 40; q += 6) { c.moveTo(x0 - ww + q, yb + ww); c.lineTo(x0 - ww + q + R.bh + 40, yb + ww - R.bh - 40); }
      c.stroke(); c.restore();
    }
    // wall hits: short flashes where atoms strike
    var now = S.clock, life = 0.35, jref = 2 * MASS[0] * Math.sqrt(KB * 300 / MASS[0]) * 2;
    c.lineCap = 'round';
    for (var i = 0; i < S.vis.length; i++) {
      var e = S.vis[i], a = 1 - (now - e.t) / life; if (a <= 0) continue;
      var L = 3 + 7 * Math.min(2, e.j / jref);
      c.strokeStyle = 'rgba(255,240,200,' + (0.75 * a).toFixed(3) + ')'; c.lineWidth = 2;
      c.beginPath();
      if (e.w === 0) { var yy = Y(e.s); c.moveTo(x0 - 1, yy); c.lineTo(x0 - 1 - L * 0.6, yy); }
      else if (e.w === 1) { var y2 = Y(e.s); c.moveTo(x1 + 1, y2); c.lineTo(x1 + 1 + L * 0.6, y2); }
      else if (e.w === 2) { var xx = X(e.s); c.moveTo(xx, yb + 1); c.lineTo(xx, yb + 1 + L * 0.6); }
      else { var x3 = X(e.s); c.moveTo(x3, yp - 1); c.lineTo(x3, yp - 1 - L * 0.6); }
      c.stroke();
    }
    // divider
    if (g.divider) {
      var xd = X(g.W / 2), dw = Math.max(3, 2 * g.dHalf * s);
      c.fillStyle = 'rgba(249,168,212,.85)'; c.fillRect(xd - dw / 2, yp, dw, yb - yp);
      c.fillStyle = 'rgba(249,168,212,.25)'; c.fillRect(xd - dw / 2 - 2, yp, dw + 4, yb - yp);
    }
    // trail of the followed atom
    var tr = S.trail;
    if (tr.length > 4) {
      c.save(); c.beginPath(); c.rect(x0, yp, R.bw, yb - yp); c.clip();
      c.lineWidth = 1.5; c.lineJoin = 'round';
      var segs = 6, per = Math.ceil(tr.length / 2 / segs);
      for (var sgi = 0; sgi < segs; sgi++) {
        var a0 = sgi * per, a1 = Math.min(tr.length / 2 - 1, (sgi + 1) * per); if (a1 <= a0) continue;
        c.strokeStyle = 'rgba(249,168,212,' + (0.12 + 0.6 * (sgi + 1) / segs).toFixed(3) + ')';
        c.beginPath(); c.moveTo(X(tr[2 * a0]), Y(tr[2 * a0 + 1]));
        for (var p = a0 + 1; p <= a1; p++) c.lineTo(X(tr[2 * p]), Y(tr[2 * p + 1]));
        c.stroke();
      }
      c.restore();
    }
    // atoms
    var r0 = g.rad[0] * s, r1 = g.rad[1] * s, sp0 = sprite(C.he, r0), sp1 = sprite(C.ar, r1);
    var ti = -1;
    for (i = 0; i < g.n; i++) {
      if (g.tag[i] === S.track) { ti = i; continue; }
      var k = g.kind[i], spr;
      if (S.colorBySpeed) { var v = Math.sqrt(g.vx[i] * g.vx[i] + g.vy[i] * g.vy[i]) * 1000, bi = Math.min(12, Math.round(v / 225)); spr = sprite(V_BUCKETS[bi], k ? r1 : r0); }
      else spr = k ? sp1 : sp0;
      c.drawImage(spr.c, X(g.x[i]) - spr.half, Y(g.y[i]) - spr.half, spr.size, spr.size);
    }
    if (ti >= 0) {
      var st = sprite(C.pink, g.rad[g.kind[ti]] * s + 0.6);
      c.drawImage(st.c, X(g.x[ti]) - st.half, Y(g.y[ti]) - st.half, st.size, st.size);
      c.strokeStyle = 'rgba(249,168,212,.7)'; c.lineWidth = 1; c.beginPath(); c.arc(X(g.x[ti]), Y(g.y[ti]), g.rad[g.kind[ti]] * s + 4, 0, 7); c.stroke();
    }
    // piston: plate, rod and grip
    var pg = c.createLinearGradient(0, yp - 10, 0, yp); pg.addColorStop(0, '#c3d3de'); pg.addColorStop(1, '#6d8494');
    c.fillStyle = pg; c.fillRect(x0, yp - 10, R.bw, 10);
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x0, yp - 10, R.bw, 1.5);
    var mx = (x0 + x1) / 2, gy = yp - 10 - R.rod + 6, act = S.drag || S.hover;
    c.fillStyle = '#8aa0ae'; c.fillRect(mx - 3, gy + 4, 6, R.rod - 10);
    c.save(); if (act) { c.shadowColor = C.green; c.shadowBlur = 12; }
    c.fillStyle = act ? C.green : '#b9cad5'; roundRect(c, mx - 34, gy - 5, 68, 11, 5); c.fill(); c.restore();
    c.fillStyle = C.muted; c.font = '11px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    if (!S.drag) c.fillText('⇕ drag', mx + 40, gy);
    // labels under the box: scale bar and the kind of walls
    c.textBaseline = 'top'; c.fillStyle = C.muted; c.font = '11px system-ui,sans-serif';
    var bar = 5 * s, ly = yb + ww + 6;
    c.strokeStyle = C.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, ly + 5); c.lineTo(x0 + bar, ly + 5); c.moveTo(x0, ly + 1); c.lineTo(x0, ly + 9); c.moveTo(x0 + bar, ly + 1); c.lineTo(x0 + bar, ly + 9); c.stroke();
    c.textAlign = 'left'; c.fillText('5 nm', x0 + bar + 6, ly);
    c.textAlign = 'right'; c.fillStyle = hot ? ramp(T_RAMP, g.Twall) : C.muted;
    c.fillText(hot ? 'thermostat walls · ' + Math.round(g.Twall) + ' K' : 'insulated walls', x1, ly);
  }
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function panel(c, b, title) {
    c.fillStyle = 'rgba(11,27,39,.82)'; roundRect(c, b.x, b.y, b.w, b.h, 10); c.fill();
    c.strokeStyle = C.line; c.lineWidth = 1; c.stroke();
    c.fillStyle = C.ink; c.font = '600 11px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText(title, b.x + 9, b.y + 7);
  }

  function drawGauges(c, b) {
    panel(c, b, 'Pressure');
    var rd = reading(), P = S.Pfast * MNM, scale = S.Pscale;
    var cx = b.x + b.w * 0.34, cy = b.y + b.h - 30, rad = Math.min(b.w * 0.27, b.h - 50);
    // dial
    var a0 = Math.PI * 0.95, a1 = Math.PI * 2.05;
    c.lineCap = 'round'; c.lineWidth = 8; c.strokeStyle = 'rgba(143,179,198,.18)'; c.beginPath(); c.arc(cx, cy, rad, a0, a1); c.stroke();
    S.needle += (Math.min(1.08, P / scale) - S.needle) * 0.25;
    var an = a0 + (a1 - a0) * Math.max(0, S.needle);
    var dg = c.createLinearGradient(cx - rad, 0, cx + rad, 0); dg.addColorStop(0, C.green); dg.addColorStop(0.6, C.gold); dg.addColorStop(1, C.red);
    c.strokeStyle = dg; c.beginPath(); c.arc(cx, cy, rad, a0, Math.min(a1, an)); c.stroke();
    c.lineWidth = 1; c.strokeStyle = 'rgba(219,231,239,.5)'; c.fillStyle = C.muted; c.font = '10px system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var t = 0; t <= 4; t++) {
      var at = a0 + (a1 - a0) * t / 4, ca = Math.cos(at), sa = Math.sin(at);
      c.beginPath(); c.moveTo(cx + ca * (rad - 7), cy + sa * (rad - 7)); c.lineTo(cx + ca * (rad + 5), cy + sa * (rad + 5)); c.stroke();
      if (t === 0 || t === 2 || t === 4) c.fillText(trimNum(scale * t / 4), cx + ca * (rad - 17), cy + sa * (rad - 17));
    }
    c.save(); c.shadowColor = '#fff'; c.shadowBlur = 6; c.strokeStyle = '#fff'; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(an) * (rad - 4), cy + Math.sin(an) * (rad - 4)); c.stroke(); c.restore();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 3.5, 0, 7); c.fill();
    c.fillStyle = C.gold; c.font = '600 13px ui-monospace,Menlo,Consolas,monospace'; c.textBaseline = 'top';
    c.fillText(fmt(rd.P * MNM, 2) + ' mN/m', cx, cy + 9);
    // thermometer
    var tx = b.x + b.w * 0.8, tTop = b.y + 26, tBot = b.y + b.h - 34, tw = 9, T = S.Tema;
    S.thermoFill += (Math.min(1.05, T / S.Tscale) - S.thermoFill) * 0.2;
    c.fillStyle = 'rgba(143,179,198,.18)'; roundRect(c, tx - tw / 2, tTop, tw, tBot - tTop + 4, tw / 2); c.fill();
    var tc = ramp(T_RAMP, T), fy = tBot - (tBot - tTop) * Math.max(0, S.thermoFill);
    c.save(); c.shadowColor = tc; c.shadowBlur = 8; c.fillStyle = tc;
    c.fillRect(tx - tw / 2 + 2, fy, tw - 4, tBot - fy + 4); c.beginPath(); c.arc(tx, tBot + 8, 8, 0, 7); c.fill(); c.restore();
    c.fillStyle = C.muted; c.font = '10px system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.fillText(S.Tscale + ' K', tx + 9, tTop + 4); c.fillText('0 K', tx + 9, tBot);
    c.fillStyle = C.gold; c.font = '600 13px ui-monospace,Menlo,Consolas,monospace'; c.textAlign = 'center'; c.textBaseline = 'top';
    c.fillText(Math.round(T) + ' K', tx - 4, tBot + 19);
  }
  function trimNum(v) { return v >= 10 ? String(Math.round(v)) : String(+v.toFixed(2)); }

  function drawHist(c, b) {
    panel(c, b, 'Speeds');
    var n0 = S.nk[0], n1 = S.nk[1];
    // choose the speed axis from the lightest kind present
    var mL = n0 ? MASS[0] : MASS[1], Tl = n0 ? S.Tk[0] : S.Tk[1], need = 2.7 * Math.sqrt(2 * KB * Math.max(Tl, 50) / mL) * 1000, ax = S.vAxis;
    if (need > ax || need < 0.55 * ax) { for (var q = 0; q < V_AXES.length; q++) if (V_AXES[q] >= need) break; var nv = V_AXES[Math.min(q, V_AXES.length - 1)]; if (nv !== S.vAxis) { S.vAxis = nv; S.hist[0].fill(0); S.hist[1].fill(0); } }
    var px = b.x + 10, pw = b.w - 20, py = b.y + 24, ph = b.h - 24 - 30, bw = pw / B, dv = S.vAxis / B / 1000;
    var ymax = 0.02, k, i;
    for (k = 0; k < 2; k++) if (S.nk[k]) for (i = 0; i < B; i++) ymax = Math.max(ymax, S.hist[k][i]);
    for (k = 0; k < 2; k++) if (S.nk[k]) { var vp = Math.sqrt(KB * S.Tk[k] / MASS[k]); ymax = Math.max(ymax, GM.mb2d(vp, MASS[k], S.Tk[k]) * dv); }
    S.yMax += (ymax * 1.12 - S.yMax) * 0.08; if (S.yMax < ymax) S.yMax = ymax * 1.05;
    var yS = ph / S.yMax, cols = [C.he, C.ar];
    for (k = 0; k < 2; k++) {
      if (!S.nk[k]) continue;
      c.fillStyle = hexA(cols[k], 0.5);
      for (i = 0; i < B; i++) { var hh = S.hist[k][i] * yS; if (hh > 0.3) c.fillRect(px + i * bw + 0.5, py + ph - hh, bw - 1, hh); }
    }
    for (k = 0; k < 2; k++) {
      if (!S.nk[k]) continue;
      c.strokeStyle = k ? '#d0ebff' : '#fff3bf'; c.lineWidth = 1.8; c.beginPath();
      for (i = 0; i <= 90; i++) { var v = S.vAxis / 1000 * i / 90, yv = GM.mb2d(v, MASS[k], S.Tk[k]) * dv * yS; var xx = px + pw * i / 90, yy = py + ph - Math.min(ph + 4, yv); if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); }
      c.stroke();
    }
    axisX(c, px, py + ph, pw, S.vAxis, 'speed, m/s');
    // legend
    c.font = '10px system-ui,sans-serif'; c.textAlign = 'right'; c.textBaseline = 'top';
    var lx = b.x + b.w - 9, lt = 'Maxwell–Boltzmann', lw = c.measureText(lt).width, ly = py + 2;
    c.fillStyle = C.muted; c.fillText(lt, lx, ly);
    c.strokeStyle = '#fff3bf'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(lx - lw - 18, ly + 5.5); c.lineTo(lx - lw - 5, ly + 5.5); c.stroke();
  }
  function axisX(c, x, y, w, vmax, label) {
    c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 0.5); c.lineTo(x + w, y + 0.5); c.stroke();
    c.fillStyle = C.muted; c.font = '10px system-ui,sans-serif'; c.textBaseline = 'top';
    var steps = w < 200 ? 2 : 4;
    for (var i = 0; i <= steps; i++) { var v = vmax * i / steps, xx = x + w * i / steps; c.textAlign = i === 0 ? 'left' : i === steps ? 'right' : 'center'; c.fillText(trimNum(v), xx, y + 4); c.beginPath(); c.moveTo(xx + 0.5, y); c.lineTo(xx + 0.5, y + 3); c.stroke(); }
    c.textAlign = 'center'; c.fillText(label, x + w / 2, y + 16);
  }

  function drawPV(c, b) {
    panel(c, b, b.w < 240 ? 'P (mN/m) vs. volume' : 'Pressure (mN/m) vs. volume');
    var rd = reading(), Pnow = rd.P * MNM, n = g.n;
    var want = Math.max(Pnow, S.Pslow * MNM) * 1.15;
    if (want > S.Pscale) S.Pscale = niceP(want); else if (want < S.Pscale * 0.3 && S.Pscale > 0.5) S.Pscale = niceP(want);
    var px = b.x + 30, pw = b.w - 40, py = b.y + 24, ph = b.h - 24 - 30, Amax = 600, Ps = S.Pscale;
    function PX(A) { return px + pw * A / Amax; }
    function PY(P) { return py + ph - ph * Math.min(1.04, P / Ps); }
    // axes
    c.strokeStyle = 'rgba(143,179,198,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(px + 0.5, py); c.lineTo(px + 0.5, py + ph); c.stroke();
    axisX(c, px, py + ph, pw, Amax, 'volume (area), nm²');
    c.fillStyle = C.muted; c.font = '10px system-ui,sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle';
    for (var t = 0; t <= 2; t++) { c.fillText(trimNum(Ps * t / 2), px - 4, py + ph - ph * t / 2); }
    // ideal-gas curve at the present temperature (an isotherm)
    if (n) {
      var Tc = g.thermo ? g.Twall : S.Tema, nkt = n * KB * Tc * MNM, col = ramp(T_RAMP, Tc);
      c.strokeStyle = hexA(col.length === 7 ? col : '#a9c4d4', 0.85); c.setLineDash([5, 4]); c.lineWidth = 1.4; c.beginPath();
      var first = true;
      for (var A = 40; A <= Amax; A += 8) { var P = nkt / A; if (P > Ps * 1.04) continue; var xx = PX(A), yy = PY(P); if (first) { c.moveTo(xx, yy); first = false; } else c.lineTo(xx, yy); }
      c.stroke(); c.setLineDash([]);
      c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = '10px system-ui,sans-serif';
      var lyy = py + ph - 9, lxx = px + 10;
      c.strokeStyle = col; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(lxx, lyy); c.lineTo(lxx + 16, lyy); c.stroke(); c.setLineDash([]);
      c.fillText('ideal gas at ' + Math.round(Tc) + ' K', lxx + 21, lyy);
    }
    // the path you've taken
    var pts = S.pv;
    for (var i = 1; i < pts.length; i++) {
      var a = 0.15 + 0.75 * i / pts.length;
      c.strokeStyle = 'rgba(249,168,212,' + a.toFixed(3) + ')'; c.lineWidth = 2; c.beginPath(); c.moveTo(PX(pts[i - 1][0]), PY(pts[i - 1][1])); c.lineTo(PX(pts[i][0]), PY(pts[i][1])); c.stroke();
    }
    var cxp = PX(g.area()), cyp = PY(Pnow);
    c.save(); c.shadowColor = C.pink; c.shadowBlur = 10; c.fillStyle = '#fff'; c.beginPath(); c.arc(cxp, cyp, 4, 0, 7); c.fill(); c.restore();
  }

  // ---------- readouts ----------
  function signed(v, d) { return (v > 0 ? '+' : '') + fmt(v, d); }
  function updateText() {
    var rd = reading(), n = g.n, A = g.area();
    var P = rd.P * MNM, nkt = n * KB * rd.T * ZJ;
    el.rT.textContent = n ? Math.round(S.Tema) + ' K' : '—';
    el.rP.textContent = n ? fmt(P, 3) + ' mN/m' : '—';
    el.rAvg.textContent = rd.avg ? Math.round(rd.avg) + ' ps' : 'settling…';
    el.rA.textContent = Math.round(A) + ' nm² (' + Math.round(g.H / g.Hmax * 100) + '%)';
    el.rPA.textContent = n ? Math.round(P * rd.A) + ' zJ' : '—';
    el.rNKT.textContent = n ? Math.round(nkt) + ' zJ' : '—';
    el.rRatio.textContent = n && nkt > 0 ? fmt(P * rd.A / nkt, 2) : '—';
    el.rHe.textContent = S.nk[0] ? Math.round(S.vk[0] * 1000) + ' m/s · ' + fmt(S.ek[0] * ZJ, 2) + ' zJ' : 'none';
    el.rAr.textContent = S.nk[1] ? Math.round(S.vk[1] * 1000) + ' m/s · ' + fmt(S.ek[1] * ZJ, 2) + ' zJ' : 'none';
    el.rW.textContent = signed(g.work * ZJ, 0) + ' zJ';
    el.rQ.textContent = g.thermo || Math.abs(g.heat) > 1e-9 ? signed(g.heat * ZJ, 0) + ' zJ' : '0 (insulated)';
    var ps = trimNum(PLAY * SPEEDS[S.speedIx]);
    el.hud.innerHTML = 'T <b>' + (n ? Math.round(S.Tema) : '—') + ' K</b> · P <b>' + (n ? fmt(P, 2) : '—') + '</b> mN/m<br>' + (R.wide ?
      'A ' + Math.round(A) + ' nm² · N ' + n + '<br><span class="gas-dim">1 s here = ' + ps + ' ps of real time</span>' :
      'N ' + n + ' <span class="gas-dim">· 1 s = ' + ps + ' ps</span>');
    if (!g.thermo && document.activeElement !== el.temp) el.temp.value = Math.round(clamp(S.Tema, 100, 1000) / 10) * 10;
    el.tempO.textContent = Math.round(g.thermo ? g.Twall : S.Tema) + ' K';
    if (document.activeElement !== el.vol) el.vol.value = Math.round(S.target / g.Hmax * 100);
    el.volO.textContent = Math.round(g.H / g.Hmax * 100) + '%';
  }

  // ---------- pointer: drag the piston, tap an atom to follow it ----------
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function onPiston(p) { var yp = Y(g.H); return p.x > R.bx - 14 && p.x < R.bx + R.bw + 14 && p.y > yp - 10 - R.rod - 4 && p.y < yp + 12; }
  cv.addEventListener('pointerdown', function (e) {
    var p = pos(e);
    if (onPiston(p)) { S.drag = { off: p.y - Y(g.H) }; try { cv.setPointerCapture(e.pointerId); } catch (er) { } e.preventDefault(); return; }
    if (p.x >= R.bx && p.x <= R.bx + R.bw && p.y <= R.by && p.y >= Y(g.H)) {
      var best = -1, bd = 22 * 22;
      for (var i = 0; i < g.n; i++) { var dx = X(g.x[i]) - p.x, dy = Y(g.y[i]) - p.y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
      if (best >= 0) { S.track = g.tag[best]; S.trail = []; }
    }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = pos(e);
    if (S.drag) { S.target = clamp((R.by - (p.y - S.drag.off)) / R.s, g.Hmin, g.Hmax); el.vol.value = Math.round(S.target / g.Hmax * 100); return; }
    var on = onPiston(p); if (on !== S.hover) { S.hover = on; cv.style.cursor = on ? 'grab' : 'default'; }
  });
  function endDrag() { S.drag = null; }
  cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('pointerleave', function () { if (!S.drag && S.hover) { S.hover = false; cv.style.cursor = 'default'; } });

  // ---------- main loop ----------
  LAB.loop(function (dt) {
    if (!S.paused) {
      S.clock += dt;
      stepSim(dt);
      S.pvClock += dt;
      if (S.pvClock > 0.12) {
        S.pvClock = 0;
        var last = S.pv[S.pv.length - 1], A = g.area(), P = reading().P * MNM;
        if (!last || Math.abs(last[0] - A) > 0.5 || Math.abs(last[1] - P) > 0.004 * S.Pscale) { S.pv.push([A, P]); if (S.pv.length > 320) S.pv.shift(); }
      }
      S.missionClock += dt; if (S.missionClock > 0.2) { S.missionClock = 0; checkMissions(); }
      if (S.Tema > S.Tscale * 1.02) S.Tscale = niceT(S.Tema); else if (S.Tema < S.Tscale * 0.3 && S.Tscale > 600) S.Tscale = niceT(S.Tema);
    }
    draw(); pumpToasts();
    S.uiClock += dt; if (S.uiClock > 0.25) { S.uiClock = 0; updateText(); }
  }, view);

  loadScene(ui.get('scene', 'ideal'));
  updateText();
  draw();
})();
