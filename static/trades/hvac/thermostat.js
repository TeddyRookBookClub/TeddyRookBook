/* HVAC course, Lesson 9: a thermostat and the 24-volt control circuit. The thermostat connects R (24 V from the
   control transformer in the furnace or air handler) to W (heat), Y (compressor), G (fan) and, for a heat pump, O
   (reversing valve, energized for cooling, the common "O" convention) and W2 (backup heat). C is the common return.
   Terminal letters per the common convention (see Lesson 9; colors aren't standardized). The room is a simple model:
   heat leaks toward the outdoor temperature, and the equipment adds or removes heat while it runs; a 1-degree
   deadband (plus or minus half a degree) sets the cycles. The model's rates and the backup-heat rule are illustrative. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-thermostat');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 520 340', role: 'img', class: 'hv-ts-w', 'aria-label': 'A thermostat wired to a furnace or air handler and an outdoor unit by the R, C, W, Y, G and O wires' }, stage);
  function txt(x, y, s, cls, anchor, parent) { var t = S('text', { x: x, y: y, class: cls || 'hv-ts', 'text-anchor': anchor || 'start' }, parent || svg); t.textContent = s; return t; }
  function part(key, name) { return S('g', { 'data-part': key, tabindex: 0, role: 'button', 'aria-label': name }, svg); }

  // ---------- thermostat ----------
  var gTs = part('tstat', 'Thermostat');
  S('rect', { class: 'th-body', x: 12, y: 16, width: 132, height: 128, rx: 16 }, gTs);
  S('rect', { class: 'th-screen', x: 24, y: 28, width: 108, height: 78, rx: 8 }, gTs);
  var tRoom = txt(78, 68, '', 'th-big', 'middle', gTs), tSet = txt(78, 86, '', 'th-small', 'middle', gTs), tMode = txt(78, 100, '', 'th-small th-mode', 'middle', gTs);
  var tCall = txt(78, 128, '', 'hv-tag th-call', 'middle', gTs);
  // terminal block
  S('rect', { class: 'th-block', x: 12, y: 156, width: 132, height: 176, rx: 8 }, svg);
  txt(78, 172, 'terminals', 'hv-ts', 'middle');
  var bus = S('path', { class: 'th-bus' }, svg);
  // ---------- indoor unit ----------
  S('rect', { class: 'th-unit', x: 248, y: 10, width: 264, height: 200, rx: 10 }, svg);
  var tUnit = txt(504, 28, '', 'hv-t hv-tb', 'end');
  var gBoard = part('board', 'Control board');
  S('rect', { class: 'th-board', x: 260, y: 26, width: 124, height: 172, rx: 6 }, gBoard);
  txt(322, 192, 'control board', 'hv-ts th-wt', 'middle', gBoard);
  var traceG = S('g', null, svg), boardTermG = S('g', null, svg);
  var gTr = part('xfmr', 'Control transformer');
  S('path', { class: 'th-coil', d: 'M334,34 q7,5 0,10 q7,5 0,10 q7,5 0,10 q7,5 0,10' }, gTr);
  S('path', { class: 'th-core', d: 'M343,32 V76' }, gTr);
  S('path', { class: 'th-coil', d: 'M352,34 q-7,5 0,10 q-7,5 0,10 q-7,5 0,10 q-7,5 0,10' }, gTr);
  S('path', { class: 'th-line', d: 'M352,34 H392 M352,74 H392' }, gTr);
  txt(394, 46, '120 V in', 'hv-ts', 'start', gTr); txt(343, 88, 'transformer', 'hv-ts th-wt', 'middle', gTr);
  var relW = S('g', null, gBoard), relG = S('g', null, gBoard);
  S('rect', { class: 'th-relay', x: 0, y: -9, width: 26, height: 18, rx: 3 }, relW); var rlW = txt(13, 4, 'W', 'hv-tag th-rl', 'middle', relW);
  S('rect', { class: 'th-relay', x: 0, y: -9, width: 26, height: 18, rx: 3 }, relG); txt(13, 4, 'G', 'hv-tag th-rl', 'middle', relG);
  // heat source: burner flames or heat strips
  var gHeat = part('heat', 'Heat source');
  var burn = S('g', null, gHeat);
  S('rect', { class: 'th-burner', x: 404, y: 100, width: 64, height: 8, rx: 3 }, burn);
  var flames = [];
  [414, 428, 442, 456].forEach(function (x) { flames.push(S('path', { class: 'th-flame', d: 'M' + (x - 5) + ',100 Q' + x + ',78 ' + (x + 5) + ',100 Z' }, burn)); });
  var strips = S('g', null, gHeat), stripEls = [];
  [80, 92, 104].forEach(function (y) { stripEls.push(S('path', { class: 'th-strip', d: 'M404,' + y + ' q5,-5 10,0 t10,0 t10,0 t10,0 t10,0 t10,0' }, strips)); });
  var tHeat = txt(436, 124, '', 'hv-ts', 'middle');
  var gBlow = part('blower', 'Blower');
  S('circle', { class: 'th-fanr', cx: 436, cy: 164, r: 22 }, gBlow);
  var blBl = S('g', null, gBlow);
  for (var b = 0; b < 8; b++) S('path', { class: 'th-blade', d: 'M436,146 q6,4 4,10', transform: 'rotate(' + (b * 45) + ' 436 164)' }, blBl);
  S('circle', { class: 'th-hub', cx: 436, cy: 164, r: 5 }, gBlow);
  txt(436, 200, 'blower', 'hv-ts', 'middle');
  // ---------- outdoor unit ----------
  S('rect', { class: 'th-unit', x: 248, y: 226, width: 264, height: 106, rx: 10 }, svg);
  var tOdu = txt(504, 322, '', 'hv-t hv-tb', 'end');
  var gCon = part('contactor', 'Contactor');
  S('rect', { class: 'th-relay', x: 262, y: 262, width: 34, height: 24, rx: 3 }, gCon);
  txt(279, 278, 'Y', 'hv-tag th-rl', 'middle', gCon); txt(279, 300, 'contactor', 'hv-ts', 'middle', gCon);
  var conBar = S('path', { class: 'th-conbar', d: 'M300,262 L318,256' }, gCon);
  var gComp = part('comp', 'Compressor');
  var comp = S('circle', { class: 'th-comp', cx: 350, cy: 282, r: 22 }, gComp);
  txt(350, 286, 'comp.', 'hv-tag th-wt2', 'middle', gComp);
  var gOfan = part('ofan', 'Outdoor fan');
  S('circle', { class: 'th-fanr', cx: 410, cy: 270, r: 20 }, gOfan);
  var ofBl = S('g', null, gOfan);
  for (var c = 0; c < 3; c++) S('ellipse', { class: 'th-oblade', cx: 410, cy: 260, rx: 4, ry: 9, transform: 'rotate(' + (c * 120) + ' 410 270)' }, ofBl);
  var gRv = part('rv', 'Reversing valve');
  S('rect', { class: 'th-rv', x: 450, y: 262, width: 50, height: 26, rx: 5 }, gRv);
  txt(475, 279, 'O', 'hv-tag th-rl', 'middle', gRv);
  var tRv2 = txt(475, 302, '', 'hv-ts', 'middle', gRv);
  // ---------- wires ----------
  var TERM = { fa: ['R', 'C', 'W', 'Y', 'G'], hp: ['R', 'C', 'Y', 'G', 'O', 'W2'] };
  var wireG = S('g', null, svg), termG = S('g', null, svg), wires = {}, termY = {}, boardY = {}, traces = {};
  function buildWires(sys) {
    wireG.innerHTML = ''; termG.innerHTML = ''; traceG.innerHTML = ''; boardTermG.innerHTML = ''; wires = {}; termY = {}; boardY = {}; traces = {};
    TERM[sys].forEach(function (k, i) {
      var y = 194 + i * 23, by = 40 + i * 24; termY[k] = y; boardY[k] = by;
      txt(30, y + 4, k, 'th-term', 'middle', termG);
      S('circle', { class: 'th-screw', cx: 54, cy: y, r: 5 }, termG);
      S('circle', { class: 'th-screw', cx: 270, cy: by, r: 4.5 }, boardTermG);
      txt(282, by + 4, k, 'hv-tag th-wt', 'start', boardTermG);
      var lane = 150 + i * 14, d = 'M59,' + y + ' H' + lane + ' V' + by + ' H265';
      wires[k] = S('path', { class: 'th-wire th-w-' + k, d: d }, wireG);
      S('path', { class: 'th-flow', d: d }, wireG).dataset.k = k;
      // board traces
      var tr = null;
      if (k === 'R') tr = 'M275,' + by + ' H334';
      if (k === 'C') tr = 'M275,' + by + ' H300 V74 H334';
      if (k === 'W' || k === 'W2') { tr = 'M275,' + by + ' H330 M356,' + by + ' H384 L404,' + (sys === 'fa' ? 104 : 92); relW.setAttribute('transform', 'translate(330 ' + by + ')'); }
      if (k === 'G') { tr = 'M275,' + by + ' H330 M356,' + by + ' H384 L416,160'; relG.setAttribute('transform', 'translate(330 ' + by + ')'); }
      if (k === 'Y') tr = 'M275,' + by + ' H306 V198 V244 H279 V262';
      if (k === 'O') tr = 'M275,' + by + ' H316 V198 V240 H475 V262';
      if (tr) { traces[k] = S('path', { class: 'th-trace th-w-' + k, d: tr }, traceG); }
    });
  }
  // ---------- strip chart (in the side panel) ----------
  side.innerHTML =
    '<div class="hv-head"><h3>Thermostat and 24-volt controls</h3><span>a simple model</span></div>' +
    '<div class="tr-field"><span>System</span><div class="tr-seg th-sys" role="group" aria-label="System"><button type="button" data-v="fa">Furnace and AC</button><button type="button" data-v="hp">Heat pump</button></div></div>' +
    '<div class="tr-field"><span>Mode</span><div class="tr-seg th-mode" role="group" aria-label="Mode"><button type="button" data-v="off">Off</button><button type="button" data-v="heat">Heat</button><button type="button" data-v="cool">Cool</button></div></div>' +
    '<div class="tr-field"><span>Fan</span><div class="tr-seg th-fan" role="group" aria-label="Fan"><button type="button" data-v="auto">Auto</button><button type="button" data-v="on">On</button></div></div>' +
    '<label class="tr-field">Setting: <span class="v th-v1"></span><input type="range" class="th-set" min="60" max="80" step="1" value="70" aria-label="Thermostat setting, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Outdoors: <span class="v th-v2"></span><input type="range" class="th-out" min="0" max="100" step="1" value="35" aria-label="Outdoor temperature, degrees Fahrenheit"></label>' +
    '<div class="tr-out th-read" aria-live="polite"></div>' +
    '<svg class="th-chart" viewBox="0 0 320 120" role="img" aria-label="Room temperature over the last two simulated hours, with the setting and the times the equipment ran"></svg>' +
    '<p class="hv-legend" style="margin-top:0"><span><i style="background:rgba(194,24,91,.25)"></i>the setting ± half a degree (the deadband)</span><span><i style="background:#2e7d4f"></i>equipment running</span></p>' +
    '<div class="tr-partname th-part" aria-live="polite"><b>Tap a part</b> to see what it does.</div>';
  var q = function (s) { return side.querySelector(s); };
  var chart = q('.th-chart'), iSet = q('.th-set'), iOut = q('.th-out'), elRead = q('.th-read'), elPart = q('.th-part');
  var chOn = S('g', null, chart), chSet = S('path', { class: 'th-chset' }, chart), chBand = S('rect', { class: 'th-chband' }, chart), chLine = S('path', { class: 'th-chline' }, chart);
  var chT1 = S('text', { class: 'hv-ts', x: 6, y: 13 }, chart), chT2 = S('text', { class: 'hv-ts', x: 314, y: 13, 'text-anchor': 'end' }, chart);
  chT2.textContent = 'last 2 hours (simulated) →';

  // ---------- model ----------
  var st = { sys: 'fa', mode: 'heat', fan: 'auto', room: 68.4, call: { W: 0, Y: 0, G: 0, O: 0, W2: 0 }, blower: 0, heatOn: 0, delay: 0, runOn: 0, hist: [], t: 0 };
  function umode() { try { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; } catch (e) { return 'both'; } }
  function f2c(f) { return (f - 32) * 5 / 9; }
  function tf(f, d) { var m = umode(), a = f.toFixed(d || 0) + '°F', b = f2c(f).toFixed(d || 0).replace('-', '−') + '°C'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function ts(f, d) { return umode() === 'metric' ? f2c(f).toFixed(d || 0).replace('-', '−') + '°' : f.toFixed(d || 0) + '°'; }
  function step(dm) { // dm = simulated minutes
    var set = +iSet.value, out = +iOut.value, hp = st.sys === 'hp', c = st.call;
    // thermostat decisions (deadband +/- 0.5 degree)
    var heatCall = c.W || (hp && c.Y && !c.O), coolCall = c.Y && (!hp || c.O);
    if (st.mode === 'heat') {
      if (st.room < set - 0.5) heatCall = 1; else if (st.room > set + 0.5) heatCall = 0;
      coolCall = 0;
    } else if (st.mode === 'cool') {
      if (st.room > set + 0.5) coolCall = 1; else if (st.room < set - 0.5) coolCall = 0;
      heatCall = 0;
    } else { heatCall = 0; coolCall = 0; }
    var n = { W: 0, Y: 0, G: 0, O: 0, W2: 0 };
    if (!hp) { n.W = heatCall ? 1 : 0; n.Y = coolCall ? 1 : 0; n.G = (coolCall || st.fan === 'on') ? 1 : 0; }
    else {
      n.Y = (heatCall || coolCall) ? 1 : 0; n.O = coolCall ? 1 : 0; n.G = (n.Y || st.fan === 'on') ? 1 : 0;
      n.W2 = heatCall && st.room < set - 2 ? 1 : (c.W2 && heatCall && st.room < set - 0.5 ? 1 : 0);   // model rule for backup heat
    }
    st.call = n;
    // furnace runs its own blower: on after a short delay, off after a short run-on (model: 1 simulated minute each)
    if (!hp) {
      if (n.W) { st.delay += dm; st.runOn = 1.5; } else { st.delay = 0; st.runOn = Math.max(0, st.runOn - dm); }
      st.blower = (n.G || (n.W && st.delay > 1) || (!n.W && st.runOn > 0)) ? 1 : 0;
    } else { st.blower = n.G; }
    // room physics (illustrative rates, degrees F per simulated minute)
    var dT = (out - st.room) / 150;
    if (!hp && n.W) dT += 0.45;
    if (n.Y && (!hp || n.O)) dT -= 0.3;
    if (hp && n.Y && !n.O) dT += 0.18 + 0.2 * Math.max(0, Math.min(1, (out + 10) / 60));
    if (hp && n.W2) dT += 0.35;
    st.room += dT * dm;
    st.t += dm;
    st.hist.push({ t: st.t, T: st.room, on: (n.W || n.Y || n.W2) ? 1 : 0 });
    while (st.hist.length && st.t - st.hist[0].t > 120) st.hist.shift();
  }
  var lastRead = '';
  function render() {
    var hp = st.sys === 'hp', c = st.call, set = +iSet.value;
    q('.th-v1').textContent = tf(set); q('.th-v2').textContent = tf(+iOut.value);
    [['.th-sys', st.sys], ['.th-mode', st.mode], ['.th-fan', st.fan]].forEach(function (a) { q(a[0]).querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === a[1] ? 'true' : 'false'); }); });
    tRoom.textContent = ts(st.room, 1); tSet.textContent = 'set ' + ts(set); tMode.textContent = st.mode.toUpperCase() + (st.fan === 'on' ? ' · FAN ON' : '');
    var calls = ['W', 'Y', 'G', 'O', 'W2'].filter(function (k) { return c[k]; });
    tCall.textContent = calls.length ? 'calling: ' + calls.join(' ') : 'satisfied';
    // wires
    Object.keys(wires).forEach(function (k) { var on = k === 'R' || k === 'C' ? 1 : c[k]; wires[k].classList.toggle('th-on', !!on); if (traces[k]) traces[k].classList.toggle('th-on', !!on); });
    wireG.querySelectorAll('.th-flow').forEach(function (f) { var k = f.dataset.k; f.style.display = (k !== 'R' && k !== 'C' && c[k]) ? '' : 'none'; });
    // bus: R screw to each energized terminal
    var ys = Object.keys(termY).filter(function (k) { return k !== 'R' && k !== 'C' && c[k]; }).map(function (k) { return termY[k]; });
    bus.setAttribute('d', ys.length ? 'M48,' + termY.R + ' H44 V' + Math.max.apply(null, ys) + ys.map(function (y) { return ' M44,' + y + ' H49'; }).join('') : '');
    // equipment
    tUnit.textContent = hp ? 'air handler' : 'furnace';
    tOdu.textContent = hp ? 'outdoor heat pump' : 'outdoor air conditioner';
    burn.style.display = hp ? 'none' : ''; strips.style.display = hp ? '' : 'none';
    flames.forEach(function (f) { f.style.opacity = !hp && c.W ? 1 : 0; });
    stripEls.forEach(function (e) { e.classList.toggle('th-hot', !!(hp && c.W2)); });
    tHeat.textContent = hp ? (c.W2 ? 'backup heat on' : 'backup heat strips') : (c.W ? 'burners on' : 'burners');
    rlW.textContent = hp ? 'W2' : 'W';
    relG.style.display = ''; relW.style.display = '';
    gRv.style.display = hp ? '' : 'none';
    tRv2.textContent = hp ? (c.O ? 'set for cooling' : 'set for heating') : '';
    conBar.setAttribute('d', c.Y ? 'M298,268 L326,268' : 'M298,268 L324,258');
    comp.classList.toggle('th-run', !!c.Y);
    // readout
    var lines = [];
    if (st.mode === 'off') lines.push('The system is off: no wire is energized except R and C, which always have 24 volts between them.');
    else if (!calls.length || (calls.length === 1 && c.G && st.fan === 'on')) lines.push('The room is within half a degree of the setting, so the thermostat isn’t calling. ' + (st.fan === 'on' ? 'With the fan set to On, R–G keeps the blower running.' : ''));
    if (!hp && c.W) lines.push('<b>R → W:</b> a call for heat. The furnace’s control board runs its start-up (Lesson 3) and switches the blower on itself once the heat exchanger is warm.');
    if (!hp && c.Y) lines.push('<b>R → Y and G:</b> a call for cooling. Y closes the contactor in the outdoor unit, starting the compressor and fan; G runs the indoor blower.');
    if (hp && c.Y && !c.O) lines.push('<b>R → Y and G:</b> the compressor and blower run. O stays off, so (with this common O-type wiring) the reversing valve stays in heating.');
    if (hp && c.O) lines.push('<b>R → Y, G and O:</b> O energizes the reversing valve for cooling; the compressor and blower run.');
    if (hp && c.W2) lines.push('<b>R → W2:</b> the room is falling behind, so the thermostat adds backup heat strips. They work at a COP of 1, so they cost more to run.');
    var rh = lines.map(function (l) { return '<p>' + l + '</p>'; }).join('');
    if (rh !== lastRead) { elRead.innerHTML = rh; lastRead = rh; }
    // chart
    var H = st.hist, x0 = 6, x1 = 314, y0 = 104, y1 = 18, lo = set - 3, hi = set + 3;
    function X(t) { return x1 - (st.t - t) / 120 * (x1 - x0); }
    function Y(v) { return y0 - (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (y0 - y1); }
    chSet.setAttribute('d', 'M' + x0 + ',' + Y(set).toFixed(1) + ' H' + x1);
    chBand.setAttribute('x', x0); chBand.setAttribute('width', x1 - x0); chBand.setAttribute('y', Y(set + 0.5).toFixed(1)); chBand.setAttribute('height', (Y(set - 0.5) - Y(set + 0.5)).toFixed(1));
    chLine.setAttribute('d', H.length ? 'M' + H.map(function (h) { return X(h.t).toFixed(1) + ',' + Y(h.T).toFixed(1); }).join(' L') : '');
    chOn.innerHTML = '';
    var run = null;
    H.forEach(function (h, i) {
      if (h.on && run === null) run = h.t;
      if ((!h.on || i === H.length - 1) && run !== null) { S('rect', { class: 'th-chon', x: X(run).toFixed(1), y: y0 + 2, width: Math.max(1, X(h.t) - X(run)).toFixed(1), height: 8 }, chOn); run = null; }
    });
    chT1.textContent = 'room temperature';
  }
  var spin = 0, spin2 = 0, dash = 0, acc = 0;
  T.loop(root, function (dt) {
    var dm = dt * 4;                         // 4 simulated minutes per second
    acc += dm;
    while (acc > 0.25) { step(0.25); acc -= 0.25; }
    if (!T.reduced) {
      if (st.blower) { spin = (spin + dt * 600) % 360; blBl.setAttribute('transform', 'rotate(' + spin.toFixed(1) + ' 436 164)'); }
      if (st.call.Y) { spin2 = (spin2 + dt * 700) % 360; ofBl.setAttribute('transform', 'rotate(' + spin2.toFixed(1) + ' 410 270)'); }
      dash = (dash + dt * 30) % 20; wireG.querySelectorAll('.th-flow').forEach(function (f) { f.style.strokeDashoffset = (-dash).toFixed(1); });
    }
    render();
  });
  var PARTS = {
    tstat: ['Thermostat', 'Senses the room and closes R–W, R–Y, R–G (and R–O, R–W2 for a heat pump). It switches 24-volt signals, not the equipment’s power.'],
    xfmr: ['Control transformer', 'Inside the furnace or air handler, it steps 120 volts down to 24 volts AC for the control circuit. R and C come from its 24-volt side.'],
    board: ['Control board', 'Receives the thermostat’s signals and runs the equipment: relays for the heat and the blower, plus the furnace’s safety checks.'],
    heat: ['Heat source', 'A gas furnace’s burners (W), or a heat pump air handler’s backup electric heat strips (W2).'],
    blower: ['Blower', 'Moves the air. In cooling and heat pump modes the thermostat calls it with G; a gas furnace’s board starts it after the heat exchanger warms.'],
    contactor: ['Contactor', 'A heavy switch in the outdoor unit. The 24-volt Y signal pulls it closed, and it switches the 240-volt power to the compressor and fan.'],
    comp: ['Compressor', 'Pumps the refrigerant (Lessons 4 to 6). It runs whenever Y is on.'],
    ofan: ['Outdoor fan', 'Moves air through the outdoor coil while the compressor runs.'],
    rv: ['Reversing valve', 'Heat pumps only. With common O-type wiring, O energizes it for cooling; some brands use B to energize it for heating.']
  };
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function show() { var p = PARTS[g.dataset.part]; if (!p) return; svg.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('sel', x === g); }); elPart.innerHTML = '<b>' + p[0] + ':</b> ' + p[1]; }
    g.addEventListener('click', show);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
  });
  function seg(sel, key, fn) { q(sel).querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { st[key] = b.dataset.v; if (fn) fn(); render(); }); }); }
  seg('.th-sys', 'sys', function () { buildWires(st.sys); st.call = { W: 0, Y: 0, G: 0, O: 0, W2: 0 }; });
  seg('.th-mode', 'mode', function () { if (st.mode === 'cool' && +iOut.value < 75) { iOut.value = 92; } if (st.mode === 'heat' && +iOut.value > 60) { iOut.value = 35; } });
  seg('.th-fan', 'fan');
  [iSet, iOut].forEach(function (i) { i.addEventListener('input', render); });
  D.addEventListener('trb-units', render);
  buildWires('fa');
  for (var k = 0; k < 200; k++) step(0.25);    // start with some history on the chart
  render();
})(window, document);
