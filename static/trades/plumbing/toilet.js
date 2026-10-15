/* Plumbing course, Lesson 4: an animated toilet cutaway.
   Press the handle: the flapper lifts, tank water rushes into the bowl, the trapway fills and a siphon empties the bowl until
   air breaks it (the gurgle). The float drops and opens the fill valve; the refill tube tops up the bowl through the overflow
   tube; the rising float shuts the valve. Gallons per flush: 1.28 (WaterSense), 1.6 (federal standard), up to 6 (older toilets),
   all from EPA WaterSense. The dye test (EPA): color in the bowl after 10 minutes without flushing means a leaking flapper.
   Time is sped up and flows are illustrative; total water per flush equals the gallons per flush you pick. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-toilet');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  // geometry
  var TB = 168, SET = 94, OVF = 80, WEIR = 232;          // tank: flapper top, normal set level, overflow top; bowl weir level
  var st = { gpf: 1.6, Vt: 1, Bw: 1, tau: 0, siphon: false, flap: 0, flapOpen: false, fill: false, setY: SET, fault: 'none',
             dye: 0, bowlDye: 0, flushes: 0, phase: 'ready', ph: 0, gurgle: 0, leakT: 0, phantom: 0, handle: 0, used: 0, dyeT: -1 };
  var BOWL = 'M50,196 Q56,284 150,294 L178,292 Q192,262 204,232 L214,196 Z';
  // volumes are fractions of the tank's flush volume: Vt = 1 is full at the set level; Bw = 1 is standing water at the weir
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 440 350', role: 'img', 'aria-label': 'Cutaway of a toilet: tank with flapper, fill valve, float, refill tube and overflow tube; bowl with the trapway', class: 'pl-to' }, stage);
  svg.innerHTML = '<defs><clipPath id="to-bowl"><path d="' + BOWL + '"/></clipPath>' +
    '<clipPath id="to-tank"><rect x="268" y="46" width="136" height="128" rx="4"/></clipPath></defs>';
  function part(key, name) { return S('g', { 'data-part': key, tabindex: '0', role: 'button', 'aria-label': name }, svg); }
  S('path', { class: 'pl-to-floor', d: 'M0,331 H440' }, svg);
  S('path', { class: 'pl-to-wall', d: 'M420,0 V331' }, svg);
  // bowl body
  var gBowl = part('bowl', 'Bowl');
  S('path', { class: 'pl-to-china', d: 'M36,186 H270 V200 Q274,262 262,300 L256,330 H150 L158,304 Q40,304 36,196 Z' }, gBowl);
  S('path', { class: 'pl-to-in', d: BOWL }, gBowl);
  var bowlW = S('rect', { class: 'pl-to-w', x: 40, width: 230, 'clip-path': 'url(#to-bowl)' }, gBowl);
  var bowlDye = S('rect', { class: 'pl-to-dye', x: 40, width: 230, 'clip-path': 'url(#to-bowl)', opacity: 0 }, gBowl);
  // rim channel and jet
  var gRim = part('rim', 'Rim channel and siphon jet');
  S('path', { class: 'pl-to-chan', d: 'M300,182 L284,192 H52' }, gRim);
  S('path', { class: 'pl-to-chan', d: 'M258,194 Q262,214 214,206' }, gRim);
  var rimFlow = S('path', { class: 'pl-to-flow', d: 'M300,182 L284,192 H52 M258,194 Q262,214 214,206' }, gRim);
  // trapway
  var gTrap = part('trapway', 'Trapway: the built-in trap and siphon');
  var TW = 'M176,291 C200,304 214,262 222,244 C228,230 240,226 246,236 C250,244 250,256 250,270 V330';
  S('path', { class: 'pl-to-tpo', d: TW }, gTrap); S('path', { class: 'pl-to-tpi', d: TW }, gTrap);
  var twIn = S('path', { class: 'pl-to-tww', d: 'M176,291 C200,304 214,262 222,244 C226,236 230,232 234,231' }, gTrap);
  var twOut = S('path', { class: 'pl-to-tww', d: 'M234,231 C240,228 246,230 248,238 C250,246 250,256 250,270 V330' }, gTrap);
  // tank
  var gTank = part('tank', 'Tank');
  S('rect', { class: 'pl-to-china', x: 262, y: 40, width: 150, height: 142, rx: 8 }, gTank);
  S('rect', { class: 'pl-to-in', x: 268, y: 46, width: 136, height: 128, rx: 4 }, gTank);
  var tankW = S('rect', { class: 'pl-to-w', x: 268, width: 136, 'clip-path': 'url(#to-tank)' }, gTank);
  var tankDye = S('rect', { class: 'pl-to-dye', x: 268, width: 136, 'clip-path': 'url(#to-tank)', opacity: 0 }, gTank);
  S('path', { class: 'pl-to-mark', d: 'M272,' + SET + ' h10' }, svg);
  // overflow tube
  var gOv = part('overflow', 'Overflow tube');
  S('rect', { class: 'pl-to-tube', x: 318, y: OVF, width: 12, height: 94 }, gOv);
  var ovFlow = S('path', { class: 'pl-to-flow', d: 'M324,' + (OVF + 2) + ' V172' }, gOv);
  // flush valve seat and flapper
  S('path', { class: 'pl-to-seat', d: 'M286,174 H318' }, svg);
  var gFlap = part('flapper', 'Flapper');
  var flapper = S('rect', { class: 'pl-to-flap', x: 288, y: 166, width: 28, height: 9, rx: 4 }, gFlap);
  // fill valve, float and refill tube
  var gFill = part('fill', 'Fill valve');
  S('rect', { class: 'pl-to-tube', x: 374, y: 66, width: 10, height: 108 }, gFill);
  S('rect', { class: 'pl-to-valve', x: 368, y: 56, width: 22, height: 14, rx: 3 }, gFill);
  S('path', { class: 'pl-to-supply', d: 'M379,174 V200 H420' }, gFill);
  var fillFlow = S('path', { class: 'pl-to-flow', d: 'M379,198 V70' }, gFill);
  var gFloat = part('float', 'Float');
  var flt = S('rect', { class: 'pl-to-float', x: 364, width: 30, height: 16, rx: 4 }, gFloat);
  var gRef = part('refill', 'Refill tube');
  S('path', { class: 'pl-to-refill', d: 'M368,60 Q340,56 326,72' }, gRef);
  var refFlow = S('path', { class: 'pl-to-flow', d: 'M368,60 Q340,56 326,72' }, gRef);
  // handle, lever and chain
  var gHan = part('handle', 'Handle, lever and chain');
  var lever = S('g', null, gHan);
  S('path', { class: 'pl-to-lever', d: 'M250,60 H300' }, lever);
  S('rect', { class: 'pl-to-handle', x: 244, y: 54, width: 12, height: 12, rx: 3 }, gHan);
  var chain = S('path', { class: 'pl-to-chain' }, gHan);
  // labels
  [['tank', 400, 34, 'end'], ['bowl', 70, 214, 'start'], ['trapway', 236, 318, 'end'], ['to the drain', 258, 345, 'start'], ['water line', 256, 98, 'end']].forEach(function (l) {
    S('text', { class: 'pl-to-t', x: l[1], y: l[2], 'text-anchor': l[3] }, svg).textContent = l[0];
  });
  var gurT = S('text', { class: 'pl-to-t pl-to-gur', x: 150, y: 262, 'text-anchor': 'middle' }, svg);
  var dyeT = S('text', { class: 'pl-to-t pl-to-b', x: 150, y: 176, 'text-anchor': 'middle' }, svg);

  side.innerHTML =
    '<p class="tr-stroke"><b class="to-ph">Ready</b><span class="to-g"></span></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn to-flush">Push the handle</button><button type="button" class="hs-btn ghost to-dye">Dye test</button></div>' +
    '<div class="tr-seg to-gpf" role="group" aria-label="Gallons per flush"><button type="button" data-v="1.28" aria-pressed="false">1.28 gal (WaterSense)</button><button type="button" data-v="1.6" aria-pressed="true">1.6 gal (standard)</button><button type="button" data-v="6" aria-pressed="false">Up to 6 gal (older)</button></div>' +
    '<p class="hs-small" style="margin:.5rem 0 .2rem"><b>Try a fault:</b></p>' +
    '<div class="tr-seg to-fault" role="group" aria-label="Faults"><button type="button" data-f="none" aria-pressed="true">Working</button><button type="button" data-f="leak" aria-pressed="false">Worn flapper</button><button type="button" data-f="high" aria-pressed="false">Float set too high</button><button type="button" data-f="chain" aria-pressed="false">Chain too short</button></div>' +
    '<div class="tr-partname to-name" aria-live="polite">Tap a part to name it.</div>' +
    '<div class="tr-out to-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var out = q('.to-out'), phT = q('.to-ph'), gT = q('.to-g'), nameBox = q('.to-name');
  var NAMES = { tank: '<b>Tank:</b> stores the water for the next flush.', bowl: '<b>Bowl:</b> holds standing water up to the top of the trapway; that water is the toilet’s trap seal.',
    rim: '<b>Rim and jet:</b> tank water enters the bowl through holes under the rim and a jet near the bottom that helps start the siphon.',
    trapway: '<b>Trapway:</b> a curved passage that rises before it falls. Filled with rushing water, it becomes a siphon.',
    overflow: '<b>Overflow tube:</b> if the fill valve doesn’t shut off, water spills down this tube into the bowl instead of onto the floor.',
    flapper: '<b>Flapper:</b> a rubber plug over the flush valve. EPA: worn flappers cause most toilet leaks; replace at least every five years.',
    fill: '<b>Fill valve:</b> lets supply water in when the float drops and shuts off when it rises.', float: '<b>Float:</b> rides on the water. Buoyancy lifts it; at the set level it closes the fill valve.',
    refill: '<b>Refill tube:</b> sends some refill water down the overflow tube to refill the bowl and restore the trap seal.',
    handle: '<b>Handle, lever and chain:</b> lift the flapper. Too short a chain holds it open; too long can tangle under it.' };
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function show() { svg.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('sel', x === g); }); nameBox.innerHTML = NAMES[g.dataset.part]; }
    g.addEventListener('click', show);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { show(); e.preventDefault(); } });
  });

  var PH = { ready: 'Ready', lift: 'Handle pushed: the flapper lifts', rush: 'Tank water rushes into the bowl', siphon: 'The trapway fills: the siphon pulls the bowl empty',
    gurgle: 'Air gets in and breaks the siphon: the gurgle', refill: 'The float dropped: the fill valve refills the tank', topup: 'The refill tube tops up the bowl',
    shut: 'The float rises and shuts the valve', leak: 'Water seeps past the flapper', phantom: 'The fill valve turns on by itself: a “phantom flush”',
    overflow: 'Water runs over the top of the overflow tube, nonstop', open: 'The flapper is held open: water runs straight through' };
  function setPh(p) { if (st.phase !== p) { st.phase = p; st.pt = 0; phT.textContent = PH[p]; if (p === 'shut' || p === 'ready') st.inFlush = false; } }
  function flush() {
    if (st.flapOpen) return;
    st.flapOpen = true; st.handle = 0.5; st.flushes++; st.used += st.gpf; st.inFlush = true; setPh('lift');
  }
  function levelY() { return TB - st.Vt * (TB - SET); }
  function render(dt) {
    var ty = Math.max(OVF - 6, levelY());
    tankW.setAttribute('y', ty.toFixed(1)); tankW.setAttribute('height', (180 - ty).toFixed(1));
    tankDye.setAttribute('y', ty.toFixed(1)); tankDye.setAttribute('height', (180 - ty).toFixed(1)); tankDye.setAttribute('opacity', (0.55 * st.dye).toFixed(2));
    // bowl level: Bw = 1 at the weir; above → up toward the rim; below → down to the bottom
    var by = st.Bw >= 1 ? WEIR - Math.min(30, (st.Bw - 1) * 40) : 286 - (286 - WEIR) * Math.max(0, st.Bw);
    bowlW.setAttribute('y', by.toFixed(1)); bowlW.setAttribute('height', (300 - by).toFixed(1));
    bowlDye.setAttribute('y', by.toFixed(1)); bowlDye.setAttribute('height', (300 - by).toFixed(1)); bowlDye.setAttribute('opacity', (0.55 * st.bowlDye).toFixed(2));
    twIn.style.opacity = st.Bw > 0.2 || st.siphon ? 0.9 : 0.25;
    twOut.style.opacity = st.siphon ? 0.9 : Math.min(0.9, st.tau * 0.9);
    twOut.setAttribute('class', 'pl-to-tww' + (st.siphon && !T.reduced ? ' run' : ''));
    twOut.style.strokeDashoffset = st.siphon ? -(st.ph * 60) % 40 : 0;
    // float and fill flows
    var fy = Math.max(st.setY, ty) - 10;
    flt.setAttribute('y', fy.toFixed(1));
    fillFlow.style.display = st.fill ? '' : 'none';
    refFlow.style.display = st.fill ? '' : 'none';
    ovFlow.style.display = st.fill || ty <= OVF ? '' : 'none';
    rimFlow.style.display = (st.flapOpen && st.Vt > 0.02) || st.fault === 'leak' ? '' : 'none';
    rimFlow.setAttribute('class', 'pl-to-flow' + (st.flapOpen && st.Vt > 0.02 ? ' big' : ''));
    [fillFlow, refFlow, ovFlow, rimFlow].forEach(function (p) { p.style.strokeDashoffset = T.reduced ? 0 : -(st.ph * 50) % 24; });
    // flapper angle
    var a = -60 * st.flap;
    flapper.setAttribute('transform', 'rotate(' + a.toFixed(1) + ' 290 170)');
    var lx = 300 - 6 * Math.min(1, st.handle * 4), ly = 64 - 10 * Math.min(1, st.handle * 4);
    lever.setAttribute('transform', 'rotate(' + (-12 * Math.min(1, st.handle * 4)).toFixed(1) + ' 250 60)');
    var fx = 290 + 26 * Math.cos(a * Math.PI / 180), fyy = 170 + 26 * Math.sin(a * Math.PI / 180);
    var slack = st.fault === 'chain' ? 0 : 8;
    chain.setAttribute('d', 'M' + lx.toFixed(1) + ',' + ly.toFixed(1) + ' Q' + ((lx + fx) / 2 + slack).toFixed(1) + ',' + ((ly + fyy) / 2 + slack).toFixed(1) + ' ' + fx.toFixed(1) + ',' + fyy.toFixed(1));
    gurT.textContent = st.gurgle > 0 ? 'gurgle!' : '';
    gT.textContent = ' ' + st.flushes + (st.flushes === 1 ? ' flush' : ' flushes') + ' · ' + T.fmt(st.used, 2) + ' gal used';
    dyeT.textContent = st.dyeT >= 0 ? (st.dyeT < 3 ? 'waiting…' : '10 minutes later') : '';
  }
  function outText() {
    var o = '';
    if (st.fault === 'leak') o = '<p class="warn">Worn flapper.</p><p>Water seeps into the bowl and down the drain. The tank level slowly falls until the fill valve turns on by itself to top it up. EPA says a worn flapper can silently leak thousands of gallons a year. The dye test finds it: color in the bowl after 10 minutes without flushing. The fix is a new flapper; EPA suggests replacing it at least every five years.</p>';
    else if (st.fault === 'high') o = '<p class="warn">Float set too high.</p><p>The water reaches the top of the overflow tube before the float can shut the valve, so water runs into the bowl nonstop. Lower the float until the water stops below the top of the overflow tube. A running toilet can waste up to 200 gallons a day (EPA).</p>';
    else if (st.fault === 'chain') o = '<p class="warn">Chain too short.</p><p>The chain holds the flapper open, so the tank never fills and water runs straight through. Leave a little slack in the chain.</p>';
    else o = '<p class="ok">Working normally.</p><p>Each flush uses <b>' + st.gpf + ' gallons</b>: the tank’s water plus what the refill tube sends to the bowl.</p>';
    o += '<p class="hs-small">Step-by-step fixes: <a href="' + (D.getElementById('tr-lesson') ? D.getElementById('tr-lesson').dataset.base : '/') + 'being-an-adult/fix-a-running-toilet/">Fix a Running Toilet</a> (Being an Adult 101).</p>';
    out.innerHTML = o;
  }
  function step(dt) {
    st.ph += dt; st.pt = (st.pt || 0) + dt;
    if (st.phase === 'shut' && st.pt > 1.6 && st.fault === 'none') setPh('ready');
    if (st.phase === 'gurgle' && st.pt > 0.9 && st.fill) setPh('refill');
    if (st.phase === 'refill' && st.pt > 1.4 && st.fill) setPh('topup');
    if (st.handle > 0) st.handle = Math.max(0, st.handle - dt);
    var target = st.flapOpen ? 1 : 0;
    st.flap += (target - st.flap) * Math.min(1, dt * 10);
    var tankOut = 0, bowlIn = 0, fillIn = 0;
    // tank to bowl through the open flapper
    if (st.flapOpen && st.flap > 0.5) { tankOut = Math.min(st.Vt, dt * 0.9 * Math.sqrt(Math.max(0.05, st.Vt)) * 1.2); if (st.phase === 'lift') setPh('rush'); }
    if (st.fault === 'leak' && !st.flapOpen) tankOut += Math.min(st.Vt, dt * 0.012);
    st.Vt -= tankOut; bowlIn += tankOut * 1.6;
    // flapper drops when the tank is nearly empty (unless the chain holds it)
    if (st.flapOpen && st.Vt < 0.1 && st.fault !== 'chain') st.flapOpen = false;
    // fill valve: opens when the float is below its set point
    var level = levelY();
    if (!st.fill && level > st.setY + 3) { st.fill = true; if (!st.flapOpen && st.phase !== 'rush' && st.phase !== 'siphon' && st.phase !== 'gurgle') setPh(st.fault === 'leak' ? 'phantom' : 'refill'); }
    if (st.fill && level <= st.setY) { st.fill = false; if (st.fault !== 'high') setPh(st.fault === 'leak' ? 'leak' : 'shut'); }
    if (st.fault === 'high') st.fill = true;
    if (st.fill) {
      var F = dt * 0.32;
      fillIn = F; if (!st.inFlush) st.used += F * st.gpf * 0.8;
      st.Vt += F * 0.8; bowlIn += F * 0.2 * 3.8;
      if (levelY() < OVF) { var ex = (OVF - levelY()) / (TB - SET); st.Vt -= ex; bowlIn += ex * 1.6; }
    }
    if (st.fault === 'chain' && st.flapOpen && st.fill) { var through = st.Vt * Math.min(1, dt * 3); st.Vt -= through; bowlIn += through * 1.6; setPh('open'); }
    if (st.fault === 'high' && levelY() <= OVF + 0.5 && !st.flapOpen) setPh('overflow');
    // bowl: overflow over the weir fills the trapway; a full trapway starts the siphon
    st.Bw += bowlIn;
    if (!st.siphon) {
      var over = Math.max(0, st.Bw - 1);
      var spill = Math.min(over, dt * (0.4 + over * 2));
      st.Bw -= spill;
      st.tau += (over > 0.25 ? dt * 1.6 : -dt * 0.8); st.tau = Math.max(0, Math.min(1, st.tau));
      if (st.tau >= 1) { st.siphon = true; setPh('siphon'); }
    } else {
      st.Bw -= Math.min(st.Bw, dt * 1.5 * Math.sqrt(Math.max(0.02, st.Bw)));
      if (st.Bw < 0.06) { st.siphon = false; st.tau = 0; st.gurgle = 0.9; setPh('gurgle'); }
    }
    if (st.gurgle > 0) { st.gurgle -= dt; }
    // dye: the bowl picks up color only from tank water that leaks or flushes into it
    if (st.dye > 0 && tankOut > 0) st.bowlDye = Math.min(1, st.bowlDye + tankOut * 18 * st.dye);
    if (st.fill && st.dye > 0) st.dye = Math.max(0, st.dye - dt * 0.15);
    if (st.siphon) st.bowlDye = Math.max(0, st.bowlDye - dt * 0.6);
    if (st.dyeT >= 0) { st.dyeT += dt; if (st.dyeT > 6) st.dyeT = -1; }
    render(dt);
  }
  q('.to-flush').addEventListener('click', flush);
  q('.to-dye').addEventListener('click', function () { st.dye = 1; st.bowlDye = 0; st.dyeT = 0; });
  side.querySelectorAll('.to-gpf button').forEach(function (b) {
    b.addEventListener('click', function () { st.gpf = +b.dataset.v; side.querySelectorAll('.to-gpf button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); outText(); });
  });
  side.querySelectorAll('.to-fault button').forEach(function (b) {
    b.addEventListener('click', function () {
      st.fault = b.dataset.f; st.setY = st.fault === 'high' ? OVF - 14 : SET;
      if (st.fault === 'chain') { flush(); st.inFlush = false; }
      if (st.fault === 'none' || st.fault === 'leak') { st.flapOpen = false; }
      if (st.fault !== 'high' && st.Vt > 1) st.Vt = 1;
      side.querySelectorAll('.to-fault button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      setPh(st.fault === 'leak' ? 'leak' : st.fault === 'none' ? 'ready' : st.phase);
      outText();
    });
  });
  outText(); render(0);
  T.loop(root, step);
})(window, document);
