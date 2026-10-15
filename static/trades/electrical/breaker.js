/* Electrical course, Lesson 3: inside a thermal-magnetic circuit breaker, with a time-current chart.
   Thermal element: a first-order model of the bimetal. Its heat h (in units of rated-current²) follows
   dh/dt = (x² − h) / τ, with x = current ÷ rating and τ = 150 s, and the latch releases when h reaches 1.05².
   From cold, that gives a trip in about 2.3 minutes at 135 % and about 48 seconds at 200 %, inside the UL 489 limits
   that CPSC staff describe for 15- and 20-amp breakers (within 1 hour at 135 %, within 2 minutes at 200 %).
   Magnetic element: trips at once at 10 times the rating (CPSC staff: instantaneous trip at 8 to 12 times the rating).
   It is a teaching model, not the curve of any real breaker. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-breaker');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var TAU = 150, HT = 1.05 * 1.05, MAG = 10;
  var st = { rating: 20, amps: 12, h: 0, closed: true, how: '', t: 0, run: true, speed: 10, magAnim: 0, flash: 0 };

  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);

  // ---------- breaker cutaway ----------
  var svg = S('svg', { viewBox: '0 -26 300 400', role: 'img', 'aria-label': 'Cutaway of a circuit breaker: handle, contacts, spring, latch, bimetal strip and electromagnet, with current flowing through', class: 'el-brk' }, stage);
  function part(key, name) { return S('g', { 'data-part': key, tabindex: '0', role: 'button', 'aria-label': name }, svg); }
  S('rect', { class: 'el-b-case', x: 26, y: 26, width: 248, height: 318, rx: 18 }, svg);
  // handle
  var gH = part('handle', 'Handle');
  var handle = S('g', null, gH);
  S('rect', { class: 'el-b-handle', x: 141, y: -2, width: 18, height: 44, rx: 5 }, handle);
  S('circle', { class: 'el-b-pivot', cx: 150, cy: 40, r: 6 }, gH);
  var hTxt = S('text', { class: 'el-b-ht', x: 150, y: 70, 'text-anchor': 'middle' }, gH);
  // spring
  var gSp = part('spring', 'Spring');
  var spring = S('path', { class: 'el-b-spring' }, gSp);
  // latch / trip bar
  var gL = part('latch', 'Latch and trip bar');
  var latch = S('rect', { class: 'el-b-latch', x: 112, y: 150, width: 92, height: 9, rx: 3 }, gL);
  S('circle', { class: 'el-b-pivot', cx: 116, cy: 154.5, r: 3.5 }, gL);
  // line strap and fixed contact
  var gC = part('contacts', 'Contacts');
  S('path', { class: 'el-b-strap', d: 'M62,338 V128 H96' }, gC);
  S('rect', { class: 'el-b-ct', x: 92, y: 120, width: 9, height: 16, rx: 2 }, gC);
  var arm = S('g', null, gC);
  S('path', { class: 'el-b-arm', d: 'M176,96 L106,122' }, arm);
  S('rect', { class: 'el-b-ct', x: 101, y: 116, width: 9, height: 16, rx: 2, transform: 'rotate(-20 105 124)' }, arm);
  S('circle', { class: 'el-b-pivot', cx: 176, cy: 96, r: 5 }, gC);
  var arc = S('path', { class: 'el-b-arc', d: 'M101,128 l3,-6 l-4,-2 l5,-6', opacity: 0 }, svg);
  // braid
  S('path', { class: 'el-b-braid', d: 'M176,96 C196,90 214,104 214,128' }, svg);
  // bimetal
  var gB = part('bimetal', 'Bimetal strip');
  var bim = S('path', { class: 'el-b-bim' }, gB);
  var bim2 = S('path', { class: 'el-b-bim2' }, gB);
  // electromagnet
  var gM = part('magnet', 'Electromagnet');
  S('path', { class: 'el-b-strap', d: 'M214,250 V262 H232 V318 Q236,330 240,336' }, gM);
  S('rect', { class: 'el-b-core', x: 226, y: 262, width: 12, height: 56, rx: 2 }, gM);
  S('path', { class: 'el-b-coil', d: 'M222,268 h20 M222,276 h20 M222,284 h20 M222,292 h20 M222,300 h20 M222,308 h20' }, gM);
  var armat = S('rect', { class: 'el-b-armat', x: 196, y: 266, width: 7, height: 46, rx: 2 }, gM);
  S('path', { class: 'el-b-link', d: 'M199,266 V160' }, gM);
  // terminals
  var gLn = part('line', 'Line terminal');
  S('path', { class: 'el-b-stab', d: 'M50,338 v20 M74,338 v20 M50,338 H74' }, gLn);
  var gLd = part('load', 'Load terminal');
  S('rect', { class: 'el-b-lug', x: 226, y: 330, width: 30, height: 14, rx: 3 }, gLd);
  S('circle', { class: 'el-b-screw', cx: 241, cy: 337, r: 4 }, gLd);
  S('path', { class: 'el-b-wire', d: 'M256,337 H296' }, gLd);
  // labels
  function lab(x, y, s, a) { var t = S('text', { class: 'el-b-lab', x: x, y: y, 'text-anchor': a || 'start' }, svg); t.textContent = s; return t; }
  lab(36, 368, 'to bus bar'); lab(296, 326, 'to circuit', 'end');
  lab(222, 196, 'bimetal'); lab(246, 258, 'magnet'); lab(120, 146, 'latch');
  lab(78, 112, 'contacts');
  // flow path and dots
  var flowD = 'M62,350 V128 H100 L176,96 C196,90 214,104 214,128 V250 V262 H232 V318 Q236,330 240,336 H296';
  var flow = S('path', { d: flowD, fill: 'none', stroke: 'none' }, svg);
  var flen = flow.getTotalLength ? flow.getTotalLength() : 700;
  var dots = [];
  for (var i = 0; i < 22; i++) dots.push({ el: S('circle', { class: 'el-b-dot', r: 3 }, svg), t: i / 22 });

  // ---------- side: chart, controls, readout ----------
  side.innerHTML =
    '<div class="tr-seg el-b-rate" role="group" aria-label="Breaker rating"><button type="button" data-r="15" aria-pressed="false">15-amp breaker</button><button type="button" data-r="20" aria-pressed="true">20-amp breaker</button></div>' +
    '<div class="el-b-chart"></div>' +
    '<div class="tr-seg el-b-pre" role="group" aria-label="Pick a load"></div>' +
    '<label class="tr-field">Current: <span class="v b-av"></span><input type="range" class="b-amps" min="0" max="1000" step="1" aria-label="Current through the breaker in amps"></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn b-reset">Reset the breaker</button><button type="button" class="hs-btn ghost b-cool">Start over cold</button><button type="button" class="hs-btn ghost b-play">Pause</button>' +
    '<div class="tr-seg el-b-speed" role="group" aria-label="Time speed"><button type="button" data-s="1" aria-pressed="false">×1</button><button type="button" data-s="10" aria-pressed="true">×10</button><button type="button" data-s="60" aria-pressed="false">×60</button></div></div>' +
    '<div class="tr-out b-out" aria-live="polite"></div>' +
    '<p class="tr-partname b-part">Tap a part of the breaker to see what it does.</p>';
  var q = function (s) { return side.querySelector(s); };
  var iA = q('.b-amps'), out = q('.b-out');
  // chart
  var cs = S('svg', { viewBox: '0 0 320 214', role: 'img', 'aria-label': 'Time-current chart: trip time falls as current rises; magnetic trip at about 10 times the rating', class: 'el-bchart' }, q('.el-b-chart'));
  var CX0 = 50, CX1 = 310, CY0 = 186, CY1 = 10, XL0 = Math.log10(0.5), XL1 = Math.log10(20), YL0 = -2, YL1 = 4;
  function cx(m) { return CX0 + (Math.log10(m) - XL0) / (XL1 - XL0) * (CX1 - CX0); }
  function cy(s) { var l = Math.max(YL0, Math.min(YL1, Math.log10(s))); return CY0 - (l - YL0) / (YL1 - YL0) * (CY0 - CY1); }
  S('rect', { class: 'el-bc-mag', x: cx(8), y: CY1, width: cx(12) - cx(8), height: CY0 - CY1 }, cs);
  S('rect', { class: 'el-bc-no', x: CX0, y: CY1, width: cx(1.05) - CX0, height: CY0 - CY1 }, cs);
  [[0.01, '0.01 s'], [0.1, '0.1 s'], [1, '1 s'], [10, '10 s'], [60, '1 min'], [600, '10 min'], [3600, '1 h']].forEach(function (p) {
    S('path', { class: 'el-bc-grid', d: 'M' + CX0 + ',' + cy(p[0]).toFixed(1) + ' H' + CX1 }, cs);
    var tt = S('text', { class: 'el-bc-t', x: CX0 - 4, y: (cy(p[0]) + 3.5).toFixed(1), 'text-anchor': 'end' }, cs); tt.textContent = p[1];
  });
  var xt = [];
  [1, 2, 5, 10, 20].forEach(function (m) {
    S('path', { class: 'el-bc-grid', d: 'M' + cx(m).toFixed(1) + ',' + CY1 + ' V' + CY0 }, cs);
    var tt = S('text', { class: 'el-bc-t', x: cx(m).toFixed(1), y: CY0 + 12, 'text-anchor': 'middle' }, cs); xt.push([tt, m]);
  });
  var xlab = S('text', { class: 'el-bc-t', x: (CX0 + CX1) / 2, y: CY0 + 25, 'text-anchor': 'middle' }, cs);
  var magT = S('text', { class: 'el-bc-t el-bc-tm', x: (cx(8) + cx(12)) / 2, y: CY1 + 10, 'text-anchor': 'middle' }, cs); magT.textContent = 'magnetic';
  var noT = S('text', { class: 'el-bc-t', x: CX0 + 3, y: CY1 + 10 }, cs); noT.textContent = 'no trip';
  // model curve
  var d = '', m;
  for (m = 1.06; m < MAG; m *= 1.03) { var tm = tripCold(m); d += (d ? ' L' : 'M') + cx(m).toFixed(1) + ',' + cy(tm).toFixed(1); }
  d += ' L' + cx(MAG).toFixed(1) + ',' + cy(tripCold(MAG * 0.999)).toFixed(1) + ' L' + cx(MAG).toFixed(1) + ',' + cy(0.016).toFixed(1) + ' L' + cx(20).toFixed(1) + ',' + cy(0.016).toFixed(1);
  S('path', { class: 'el-bc-curve', d: d }, cs);
  // UL 489 limits (as described by CPSC staff)
  [[1.35, 3600, 'UL: within 1 h at 135%'], [2, 120, 'UL: within 2 min at 200%']].forEach(function (u, k) {
    S('path', { class: 'el-bc-ul', d: 'M' + (cx(u[0]) - 6).toFixed(1) + ',' + cy(u[1]).toFixed(1) + ' h12 M' + cx(u[0]).toFixed(1) + ',' + (cy(u[1]) - 6).toFixed(1) + ' v12' }, cs);
    var tt = S('text', { class: 'el-bc-t el-bc-tu', x: (cx(u[0]) + 8).toFixed(1), y: (cy(u[1]) + (k ? -6 : 16)).toFixed(1) }, cs); tt.textContent = u[2];
  });
  var opLine = S('path', { class: 'el-bc-op' }, cs);
  var opDot = S('circle', { class: 'el-bc-dot', r: 4.5 }, cs);
  var heatDot = S('circle', { class: 'el-bc-heat', r: 3.5 }, cs);

  function tripCold(x) { return x >= MAG ? 0.016 : (x * x <= HT ? Infinity : -TAU * Math.log(1 - HT / (x * x))); }
  function tripFrom(x, h) { if (x >= MAG) return 0; if (x * x <= HT) return Infinity; if (h >= HT) return 0; return -TAU * Math.log((x * x - HT) / (x * x - h)); }
  function f(v, dd) { return T.fmt(v, dd); }
  function dur(s) {
    if (!isFinite(s)) return 'never';
    if (s < 0.1) return 'at once (less than 0.1 s)';
    if (s < 60) return f(s, s < 10 ? 1 : 0) + ' s';
    if (s < 3600) return f(Math.floor(s / 60), 0) + ' min ' + f(Math.round(s % 60), 0) + ' s';
    return f(s / 3600, 1) + ' h';
  }
  // slider: log from 1 A to 400 A
  function ampsFrom(v) { return Math.pow(10, +v / 1000 * Math.log10(400)); }
  function sliderFrom(a) { return Math.round(1000 * Math.log10(Math.max(1, a)) / Math.log10(400)); }
  var PRE = [['Normal load', 0.6], ['Overload 135%', 1.35], ['Overload 200%', 2], ['Short circuit', 15]];
  var pre = q('.el-b-pre');
  PRE.forEach(function (p) {
    var b = T.h('button', { type: 'button', 'aria-pressed': 'false', 'data-m': p[1] }); pre.appendChild(b);
    b.addEventListener('click', function () { setAmps(p[1] * st.rating); });
  });
  function preLabels() {
    pre.querySelectorAll('button').forEach(function (b, k) { b.textContent = PRE[k][0] + ': ' + f(PRE[k][1] * st.rating, 0) + ' A'; });
    xt.forEach(function (p) { p[0].textContent = f(p[1] * st.rating, 0); });
    xlab.textContent = 'amps through a ' + st.rating + '-amp breaker (log scale)';
  }
  function setAmps(a) { st.amps = Math.max(1, Math.min(400, a)); iA.value = sliderFrom(st.amps); update(); }
  iA.addEventListener('input', function () { st.amps = ampsFrom(iA.value); update(); });
  side.querySelectorAll('.el-b-rate button').forEach(function (b) {
    b.addEventListener('click', function () {
      side.querySelectorAll('.el-b-rate button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var m = st.amps / st.rating; st.rating = +b.dataset.r; preLabels(); setAmps(m * st.rating);
    });
  });
  side.querySelectorAll('.el-b-speed button').forEach(function (b) {
    b.addEventListener('click', function () {
      side.querySelectorAll('.el-b-speed button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      st.speed = +b.dataset.s;
    });
  });
  var note = '';
  q('.b-reset').addEventListener('click', function () {
    if (st.closed) { note = 'The breaker is already on.'; }
    else if (st.h >= HT) { note = 'The bimetal is still bent from the heat. Give it a moment to cool, then try again.'; }
    else { st.closed = true; st.how = ''; note = 'Reset: pushed fully off, then on.'; st.t = 0; }
    update();
  });
  q('.b-cool').addEventListener('click', function () { st.h = 0; st.t = 0; st.closed = true; st.how = ''; note = ''; update(); });
  var playB = q('.b-play');
  playB.addEventListener('click', function () { st.run = !st.run; playB.textContent = st.run ? 'Pause' : 'Play'; if (st.run) loop.start(); });

  var PARTS = {
    handle: ['Handle', 'Shows ON, OFF or tripped. A tripped handle sits at OFF or partway between; to reset, push it fully off, then on.'],
    spring: ['Spring', 'Stretched while the breaker is on. When the latch lets go, it snaps the contacts apart.'],
    latch: ['Latch and trip bar', 'Holds the contacts closed against the spring until the bimetal or the magnet pushes the trip bar.'],
    contacts: ['Contacts', 'Carry the current when closed. As they part, a brief arc forms; AC passes through zero 120 times a second, which helps put it out.'],
    bimetal: ['Bimetal strip', 'Two metals bonded together that expand by different amounts. Current heats it, and it bends toward the trip bar. Its heating depends on current squared multiplied by time, so small overloads trip slowly.'],
    magnet: ['Electromagnet', 'The current flows through a coil. A short circuit, at about 8 to 12 times the rating, pulls the armature in hard enough to trip the latch at once.'],
    line: ['Line terminal', 'Clips onto the panel’s hot bus bar. Power comes in here.'],
    load: ['Load terminal', 'The circuit’s hot wire is screwed in here. Power goes out to the outlets and lights.']
  };
  var partBox = q('.b-part');
  svg.querySelectorAll('[data-part]').forEach(function (p) {
    function show() {
      svg.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('sel', x === p); });
      var info = PARTS[p.dataset.part]; partBox.innerHTML = '<b>' + info[0] + ':</b> ' + info[1];
    }
    p.addEventListener('click', show);
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
  });

  function draw() {
    var heat = Math.min(1, st.h / HT), bend = 16 * heat;
    // bimetal bends left at the top as it heats
    var bd = 'M214,250 C214,210 ' + (214 - bend * 0.4).toFixed(1) + ',170 ' + (214 - bend).toFixed(1) + ',132';
    bim.setAttribute('d', bd); bim2.setAttribute('d', bd);
    var r = Math.round(150 + 105 * heat), gg = Math.round(160 - 90 * heat), bb = Math.round(170 - 140 * heat);
    bim.style.stroke = 'rgb(' + r + ',' + gg + ',' + bb + ')';
    // arm and handle
    arm.setAttribute('transform', 'rotate(' + (st.closed ? 0 : -24) + ' 176 96)');
    handle.setAttribute('transform', 'rotate(' + (st.closed ? -28 : 2) + ' 150 40)');
    hTxt.textContent = st.closed ? 'ON' : 'TRIPPED';
    hTxt.setAttribute('class', 'el-b-ht' + (st.closed ? '' : ' trip'));
    var ax = st.closed ? 106 : 112;
    spring.setAttribute('d', 'M128,46 l6,8 l-12,6 l12,6 l-12,6 l12,6 l-12,6 l' + (ax - 122) + ',' + (st.closed ? 26 : 2));
    latch.setAttribute('transform', st.closed ? '' : 'rotate(-10 116 154.5)');
    armat.setAttribute('transform', 'translate(' + (6 * st.magAnim).toFixed(1) + ',0)');
    arc.setAttribute('opacity', st.flash > 0 ? Math.min(1, st.flash * 3).toFixed(2) : 0);
    // chart
    var x = st.amps / st.rating, X = cx(Math.max(0.5, Math.min(20, x)));
    opLine.setAttribute('d', 'M' + X.toFixed(1) + ',' + CY1 + ' V' + CY0);
    var tc = tripCold(x);
    opDot.setAttribute('cx', X.toFixed(1)); opDot.setAttribute('cy', (isFinite(tc) ? cy(tc) : CY1).toFixed(1));
    opDot.setAttribute('opacity', isFinite(tc) ? 1 : 0.35);
    heatDot.setAttribute('cx', X.toFixed(1)); heatDot.setAttribute('cy', cy(Math.max(0.01, st.t)).toFixed(1));
    heatDot.setAttribute('opacity', st.closed && isFinite(tc) && st.t > 0.01 ? 1 : 0);
  }
  function update() {
    var x = st.amps / st.rating;
    q('.b-av').textContent = f(st.amps, st.amps < 10 ? 1 : 0) + ' A (' + f(100 * x, 0) + '% of rating, about ' + f(st.amps * 120, 0) + ' W at 120 V)';
    iA.setAttribute('aria-valuetext', f(st.amps, 0) + ' amps');
    pre.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', Math.abs(+b.dataset.m * st.rating - st.amps) < 0.5 ? 'true' : 'false'); });
    var tc = tripCold(x), rem = tripFrom(x, st.h);
    var state = st.closed ? '<b class="ok">ON</b>' : '<b class="warn">TRIPPED (' + st.how + ')</b>';
    var why = '';
    if (!st.closed) why = st.how === 'magnetic' ? 'The huge current pulled the electromagnet’s armature in: an instant trip.' : 'The bimetal bent far enough to push the trip bar, and the spring snapped the contacts open.';
    else if (x >= MAG) why = 'Short circuit: the magnet trips it at once.';
    else if (x * x <= HT) why = 'Within its rating: the bimetal warms a little and settles, so it can carry this current indefinitely.';
    else why = 'Overload: the bimetal is heating. Trip in about ' + dur(rem) + ' more.';
    out.innerHTML = '<p>Breaker: ' + state + ' · simulated time ' + dur(st.t).replace('at once (less than 0.1 s)', '0 s') + '</p>' +
      '<p>Bimetal heat: <b>' + f(Math.min(999, 100 * st.h / HT), 0) + '%</b> of the trip point</p>' +
      '<p>From cold, this model trips at this current in: <span class="big">' + dur(tc) + '</span></p>' +
      '<p class="hs-small">' + why + (note ? ' ' + note : '') + '</p>';
    draw();
  }
  var loop = T.loop(svg, function (dt) {
    if (!st.run) return;
    var x = st.amps / st.rating, sdt = dt * st.speed;
    if (st.closed) {
      if (x >= MAG) {
        st.magAnim = Math.min(1, st.magAnim + dt * 6);
        if (st.magAnim >= 1) { st.closed = false; st.how = 'magnetic'; st.flash = 0.35; note = ''; }
      } else {
        st.magAnim = Math.max(0, st.magAnim - dt * 4);
        st.h = x * x + (st.h - x * x) * Math.exp(-sdt / TAU);
        st.t += sdt;
        if (st.h >= HT) { st.closed = false; st.how = 'thermal'; st.flash = 0.35; note = ''; }
      }
    } else {
      st.h = st.h * Math.exp(-sdt / TAU);
      st.magAnim = Math.max(0, st.magAnim - dt * 4);
    }
    st.flash = Math.max(0, st.flash - dt);
    // dots
    var spd = st.closed ? 40 + 60 * Math.log10(1 + st.amps) : 0;
    dots.forEach(function (o) {
      o.t = (o.t + dt * spd / flen) % 1;
      var p = flow.getPointAtLength ? flow.getPointAtLength(o.t * flen) : { x: 0, y: 0 };
      o.el.setAttribute('cx', p.x.toFixed(1)); o.el.setAttribute('cy', p.y.toFixed(1));
      o.el.setAttribute('opacity', st.closed ? 1 : 0);
    });
    acc += dt; if (acc > 0.2) { acc = 0; update(); } else draw();
  });
  var acc = 0;
  // reduced motion: the simulation still runs (it is the lesson), but there is no arc flash
  if (T.reduced) arc.style.display = 'none';
  preLabels();
  setAmps(12);
  dots.forEach(function (o) { var p = flow.getPointAtLength ? flow.getPointAtLength(o.t * flen) : { x: 0, y: 0 }; o.el.setAttribute('cx', p.x); o.el.setAttribute('cy', p.y); });
})(window, document);
