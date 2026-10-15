/* Electrical course, Lesson 6: how a GFCI senses a leak. The hot and neutral wires pass through a sensing coil; a GFCI opens
   its contacts when the difference between them exceeds 5 milliamps, within as little as 1/40 of a second (OSHA 3075).
   Leak current through a person: I = 120 V ÷ skin resistance, using NIOSH's figures (dry skin 100,000 ohms or more, wet skin
   as little as 1,000 ohms) and OpenStax's soaking-wet estimate of 10,000 ohms. Effects are quoted from OSHA's table.
   The tool draws 5 A (600 W). The trip is shown slowed down so you can watch it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-gfci');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var TRIP_MA = 5, TRIP_MS = 25, SLOW = 70, LOAD = 5;
  var st = { fault: true, ground: false, touch: true, R: 1000, gfci: true, tripped: false, timer: -1, test: 0, tripAt: 0 };
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage el-wide', style: '--el-mw:470px' }); grid.appendChild(stage); grid.insertBefore(T.h('p', { class: 'el-swipe', text: 'Swipe sideways to see the whole drawing.' }), stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 460 330', role: 'img', 'aria-label': 'A GFCI outlet: hot and neutral wires pass through a sensing coil on their way to a tool with a metal case. A person touches the tool; a leak through the person returns through the earth instead of the neutral.', class: 'el-gf' }, stage);
  function t(x, y, s, c, a) { var e = S('text', { class: c || 'el-gf-t', x: x, y: y, 'text-anchor': a || 'start' }, svg); e.textContent = s; return e; }
  // panel
  S('rect', { class: 'el-gf-panel', x: 8, y: 56, width: 42, height: 160, rx: 6 }, svg); t(29, 48, 'panel', 'el-gf-t', 'middle');
  // earth return
  var earth = S('path', { class: 'el-gf-earth', d: 'M432,296 V312 H24 V216' }, svg);
  t(150, 324, 'leak returns through the earth, not the neutral', 'el-gf-t el-gf-tl');
  S('path', { class: 'el-gf-floor', d: 'M262,296 H458' }, svg);
  // GFCI box
  S('rect', { class: 'el-gf-box', x: 82, y: 40, width: 164, height: 196, rx: 12 }, svg); t(164, 30, 'GFCI', 'el-gf-t el-gf-th', 'middle');
  // coil back half
  S('path', { class: 'el-gf-coilb', d: 'M150,72 A14,44 0 0 0 150,160' }, svg);
  // wires
  function wire(d, c) { S('path', { class: 'el-edge', d: d, 'stroke-width': 6.4 }, svg); return S('path', { class: 'el-w' + c, d: d, 'stroke-width': 4 }, svg); }
  wire('M50,92 H206', 'b'); wire('M222,92 H346 V104', 'b');
  wire('M50,140 H206', 'w'); wire('M222,140 H346 V128', 'w');
  var bladeH = S('path', { class: 'el-gf-blade', d: 'M206,92 L223,92' }, svg);
  var bladeN = S('path', { class: 'el-gf-blade', d: 'M206,140 L223,140' }, svg);
  S('circle', { class: 'k-node', cx: 206, cy: 92, r: 3 }, svg); S('circle', { class: 'k-node', cx: 206, cy: 140, r: 3 }, svg);
  // coil front half and glow
  var coilGlow = S('ellipse', { class: 'el-gf-glow', cx: 150, cy: 116, rx: 22, ry: 52, opacity: 0 }, svg);
  S('path', { class: 'el-gf-coil', d: 'M150,72 A14,44 0 0 1 150,160' }, svg);
  t(150, 176, 'sensing coil', 'el-gf-t', 'middle');
  // trip circuit
  S('rect', { class: 'el-gf-chip', x: 104, y: 192, width: 92, height: 30, rx: 5 }, svg); t(150, 211, 'trip circuit', 'el-gf-t', 'middle');
  S('path', { class: 'el-gf-sense', d: 'M150,160 V192 M196,206 H214 V100' }, svg);
  var diffTxt = t(84, 66, '', 'el-gf-t el-gf-diff');
  // buttons on the face
  var bTest = S('g', { class: 'el-gf-btn', tabindex: '0', role: 'button', 'aria-label': 'Press TEST' }, svg);
  S('rect', { x: 90, y: 236, width: 64, height: 22, rx: 5 }, bTest); var bt1 = S('text', { x: 122, y: 251, 'text-anchor': 'middle' }, bTest); bt1.textContent = 'TEST';
  var bReset = S('g', { class: 'el-gf-btn', tabindex: '0', role: 'button', 'aria-label': 'Press RESET' }, svg);
  S('rect', { x: 174, y: 236, width: 64, height: 22, rx: 5 }, bReset); var bt2 = S('text', { x: 206, y: 251, 'text-anchor': 'middle' }, bReset); bt2.textContent = 'RESET';
  // tool
  var gGround = S('g', null, svg);
  S('path', { class: 'el-edge', d: 'M318,160 V272 H38 V216', 'stroke-width': 5.4 }, gGround);
  S('path', { class: 'el-wg', d: 'M318,160 V272 H38 V216', 'stroke-width': 3 }, gGround);
  var gTxt = t(180, 268, 'ground wire', 'el-gf-t', 'middle'); gGround.appendChild(gTxt);
  S('rect', { class: 'el-gf-case', x: 298, y: 64, width: 96, height: 98, rx: 12 }, svg);
  S('circle', { class: 'el-gf-motor', cx: 346, cy: 116, r: 15 }, svg); t(346, 121, 'M', 'el-gf-t el-gf-th', 'middle');
  wire('M346,104 V101', 'b'); wire('M346,128 V131', 'w');
  t(346, 178, 'tool, metal case', 'el-gf-t', 'middle');
  var spark = S('path', { class: 'el-gf-spark', d: 'M330,92 l4,-8 l-6,-3 l6,-8' }, svg);
  // person
  var gP = S('g', null, svg);
  S('circle', { class: 'el-person', cx: 428, cy: 150, r: 10 }, gP);
  S('path', { class: 'el-personl', d: 'M428,160 V232 M428,176 L396,142 M428,232 L418,294 M428,232 L438,294' }, gP);
  var handWet = t(412, 196, '', 'el-gf-t', 'middle'); gP.appendChild(handWet);
  // flow paths
  var pH = S('path', { d: 'M50,92 H346 V116', fill: 'none', stroke: 'none' }, svg);
  var pN = S('path', { d: 'M346,116 V140 H50', fill: 'none', stroke: 'none' }, svg);
  var pL = S('path', { d: 'M330,90 L334,76 L396,142 L428,176 V232 L438,294 V312 H24 V216', fill: 'none', stroke: 'none' }, svg);
  var pG = S('path', { d: 'M330,90 L318,160 V272 H38 V216', fill: 'none', stroke: 'none' }, svg);
  function mk(n, cls) { var a = []; for (var i = 0; i < n; i++) a.push({ el: S('circle', { class: cls, r: 2.8 }, svg), t: i / n }); return a; }
  var dH = mk(14, 'el-gf-dot'), dN = mk(10, 'el-gf-dot'), dL = mk(16, 'el-gf-dotl'), dG = mk(14, 'el-gf-dotl');
  function len(p) { return p.getTotalLength ? p.getTotalLength() : 300; }
  var LH = len(pH), LN = len(pN), LL = len(pL), LG = len(pG);

  side.innerHTML =
    '<p class="hs-small" style="margin:0 0 .2rem">The tool:</p><div class="tr-seg gf-fault" role="group" aria-label="The tool"><button type="button" data-v="0">Healthy</button><button type="button" data-v="1">Faulty: hot touches the case</button></div>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost gf-touch" aria-pressed="true">Someone is touching it</button><button type="button" class="hs-btn ghost gf-ground" aria-pressed="false">Ground wire connected</button></div>' +
    '<p class="hs-small" style="margin:.4rem 0 .2rem">Their skin:</p><div class="tr-seg gf-skin" role="group" aria-label="Skin resistance"><button type="button" data-r="100000">Dry: 100,000 Ω</button><button type="button" data-r="10000">Soaking wet (OpenStax): 10,000 Ω</button><button type="button" data-r="1000">Wet (NIOSH): 1,000 Ω</button></div>' +
    '<p class="hs-small" style="margin:.4rem 0 .2rem">The outlet:</p><div class="tr-seg gf-out" role="group" aria-label="Outlet type"><button type="button" data-v="1">GFCI</button><button type="button" data-v="0">Ordinary outlet</button></div>' +
    '<div class="tr-out gf-res" aria-live="polite" style="margin-top:.6rem"></div>' +
    '<p class="tr-w-note">The dots show the current during one half of the AC cycle.</p>';
  var q = function (s) { return side.querySelector(s); };
  var res = q('.gf-res');
  function seg(sel, attr, cb) {
    var bs = side.querySelectorAll(sel + ' button');
    bs.forEach(function (b) { b.addEventListener('click', function () { bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); cb(b.dataset[attr]); changed(); }); });
    return bs;
  }
  seg('.gf-fault', 'v', function (v) { st.fault = v === '1'; });
  seg('.gf-skin', 'r', function (v) { st.R = +v; });
  seg('.gf-out', 'v', function (v) { st.gfci = v === '1'; if (!st.gfci) { st.tripped = false; st.timer = -1; } });
  var bTouch = q('.gf-touch'), bGround = q('.gf-ground');
  bTouch.addEventListener('click', function () { st.touch = !st.touch; bTouch.setAttribute('aria-pressed', st.touch); changed(); });
  bGround.addEventListener('click', function () { st.ground = !st.ground; bGround.setAttribute('aria-pressed', st.ground); changed(); });
  function press(fn) { return function (e) { if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return; if (e.type === 'keydown') e.preventDefault(); fn(); }; }
  function doTest() { if (!st.gfci) { note = 'An ordinary outlet has no TEST button.'; render(); return; } if (st.tripped) { note = 'It’s already tripped. Press RESET first.'; render(); return; } st.test = 1; note = 'TEST creates a small imbalance on purpose, so a working GFCI trips. Test yours monthly.'; changed(); }
  function doReset() { if (!st.gfci) return; st.tripped = false; st.timer = -1; st.test = 0; note = 'RESET closes the contacts again.'; changed(); }
  bTest.addEventListener('click', press(doTest)); bTest.addEventListener('keydown', press(doTest));
  bReset.addEventListener('click', press(doReset)); bReset.addEventListener('keydown', press(doReset));
  var note = '';
  function sync() {
    side.querySelectorAll('.gf-fault button').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.v === '1') === st.fault ? 'true' : 'false'); });
    side.querySelectorAll('.gf-skin button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.r === st.R ? 'true' : 'false'); });
    side.querySelectorAll('.gf-out button').forEach(function (b) { b.setAttribute('aria-pressed', (b.dataset.v === '1') === st.gfci ? 'true' : 'false'); });
  }
  // the physics of the moment
  function now() {
    var on = !st.tripped && !brk();
    var leak = 0, gfault = false, testI = st.test ? 0.008 : 0;
    if (on && st.fault) {
      if (st.ground) gfault = true;
      else if (st.touch) leak = 120 / st.R;
    }
    var hot = on ? LOAD + leak : 0, neu = on ? LOAD : 0;
    var diff = gfault ? Infinity : leak + (on ? testI : 0);
    return { on: on, leak: on ? leak : 0, gfault: gfault && on, hot: hot, neu: neu, diff: diff };
  }
  function effect(mA) {
    if (mA < 1) return 'generally not perceptible';
    if (mA < 5) return 'a faint tingle';
    if (mA < 6) return 'a slight shock: not painful but disturbing; the average person can let go';
    if (mA <= 30) return 'a painful shock and loss of muscular control; in the 6–25 mA (women) or 9–30 mA (men) “let-go” range, a person may not be able to let go';
    if (mA >= 50 && mA <= 150) return 'extreme pain, respiratory arrest and severe muscle contractions; death is possible';
    return 'a dangerous shock';
  }
  function f(x, d) { return T.fmt(x, d); }
  function brk() { return !st.gfci && st.fault && st.ground; }
  function changed() {
    var n = now();
    if (st.gfci && !st.tripped && n.diff * 1000 > TRIP_MA) { if (st.timer < 0) st.timer = 0; }
    else if (!st.tripped) st.timer = -1;
    if (T.reduced && st.timer >= 0) trip();
    sync(); render();
  }
  function trip() { st.tripped = true; st.tripAt = st.timer >= 0 ? TRIP_MS : 0; st.timer = -1; st.test = 0; }
  function render() {
    var n = now();
    bladeH.setAttribute('d', n.on ? 'M206,92 L223,92' : 'M206,92 L220,80');
    bladeN.setAttribute('d', n.on ? 'M206,140 L223,140' : 'M206,140 L220,128');
    spark.setAttribute('opacity', st.fault && n.on ? 1 : 0);
    gGround.style.display = st.ground ? '' : 'none';
    gP.style.display = st.touch ? '' : 'none';
    earth.style.display = st.touch && st.fault && !st.ground ? '' : 'none';
    handWet.textContent = st.R === 1000 ? 'wet hand' : st.R === 10000 ? 'soaked' : 'dry hand';
    var imb = n.diff * 1000 > TRIP_MA;
    coilGlow.setAttribute('opacity', n.on && n.diff > 0 ? (imb ? 0.9 : 0.4) : 0);
    diffTxt.textContent = n.on && n.diff > 0 ? (isFinite(n.diff) ? 'difference: ' + f(n.diff * 1000, 1) + ' mA' : 'difference: huge') : '';
    var h = '';
    if (brk()) {
      h += '<p><b class="ok">The breaker tripped.</b> With a ground wire, the fault current is so large that the breaker’s magnetic trip opens the circuit at once. That’s grounding doing its job.</p><p class="hs-small">Fix the tool (choose Healthy) to restore power.</p>';
    } else if (st.timer >= 0) {
      h += '<p><b class="warn">Leak detected: ' + (isFinite(n.diff) ? f(n.diff * 1000, 1) + ' mA' : 'a large fault current') + '</b>, more than the 5 mA trip level.</p>' +
        '<p>Time since the leak began: <span class="big">' + f(st.timer, 0) + ' ms</span> <small>(slowed down ' + SLOW + ' times)</small></p>' +
        '<div class="el-gf-tl" aria-hidden="true"><b style="width:' + Math.min(100, 100 * st.timer / TRIP_MS).toFixed(1) + '%"></b></div>';
    } else if (st.tripped) {
      h += '<p><b class="ok">Tripped.</b> The contacts opened ' + (st.tripAt ? 'after about ' + TRIP_MS + ' milliseconds (OSHA: within as little as 1/40 of a second)' : 'at once') + '. No current flows to the tool or through anyone touching it.</p>' +
        '<p class="hs-small">Press RESET to restore power. If the fault is still there, it will trip again.</p>';
    } else {
      h += '<p>Hot wire: <b>' + f(n.hot, 3) + ' A</b> out · Neutral: <b>' + f(n.neu, 3) + ' A</b> back</p>';
      if (n.leak > 0) {
        var mA = n.leak * 1000;
        h += '<p>Through the person: <span class="big">' + f(mA, mA < 10 ? 1 : 0) + ' mA</span> <small>(120 V ÷ ' + f(st.R, 0) + ' Ω)</small></p>';
        if (st.gfci && mA <= TRIP_MA) h += '<p><b>Below the 5 mA trip level, so the GFCI stays on.</b> OSHA’s table: ' + effect(mA) + '. Any tingle is a warning: stop using the tool.</p>';
        else if (!st.gfci) h += '<p class="warn">Nothing cuts the power. OSHA’s table for this current: ' + effect(mA) + '.</p><p class="hs-small">The breaker never notices: ' + f(mA, 0) + ' mA is far below its 15,000 to 20,000 mA rating.</p>';
      } else if (st.fault && !st.ground && !st.touch) {
        h += '<p><b class="warn">The case is live at 120 volts</b>, but no current is leaking yet, so the currents still match and the GFCI can’t tell. The moment someone touches the case, it trips.</p>';
      } else if (st.fault && st.ground) {
        h += '<p>With a ground wire, the fault sends a large current down the ground wire. ' + (st.gfci ? 'The GFCI trips at once.' : 'The breaker’s magnetic trip opens the circuit.') + '</p>';
      } else {
        h += '<p class="ok">Healthy: the currents out and back match, so the coil feels nothing.</p>';
      }
    }
    if (note) h += '<p class="hs-small">' + note + '</p>';
    res.innerHTML = h;
  }
  var acc = 0;
  function frame(dt) {
    if (st.timer >= 0) {
      st.timer += dt * 1000 / SLOW;
      if (st.timer >= TRIP_MS) trip();
      acc += dt; if (acc > 0.08 || st.tripped) { acc = 0; render(); }
    }
    var n = now(), slow = st.timer >= 0 ? 0.25 : 1;
    function run(list, path, L, sp, vis) {
      list.forEach(function (o) {
        o.t = (o.t + dt * sp * slow / L) % 1;
        var p = path.getPointAtLength ? path.getPointAtLength(o.t * L) : { x: 0, y: 0 };
        o.el.setAttribute('cx', p.x.toFixed(1)); o.el.setAttribute('cy', p.y.toFixed(1)); o.el.setAttribute('opacity', vis ? 1 : 0);
      });
    }
    run(dH, pH, LH, 60, n.on); run(dN, pN, LN, 60, n.on);
    run(dL, pL, LL, 20 + 80 * Math.min(1, n.leak * 8), n.leak > 0);
    run(dG, pG, LG, 160, n.gfault);
  }
  // with reduced motion the dots stay put, and the trip happens at once
  if (!T.reduced) T.loop(svg, frame);
  changed();
  frame(0);
})(window, document);
