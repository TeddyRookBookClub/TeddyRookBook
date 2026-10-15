/* Cars course, Lesson 2: an animated four-stroke engine (inline SVG).
   Crank-slider kinematics: pin height = r·cos θ + sqrt(l² − r²·sin² θ). Camshafts turn at half crank speed and their
   drawn lobes set the valve lift, so what you see is what lifts the valves. Valve timing follows typical figures in
   MIT 2.61 lecture 8 (intake opens 10° before TDC, closes 40° after BDC; exhaust opens 40° before BDC, closes 10° after TDC).
   Play/pause/step, a speed control, a crank-angle slider, and tap-a-part names. Honors prefers-reduced-motion. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-engine');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;

  // ----- geometry (SVG units) -----
  var CX = 220, CY = 382, R = 48, L = 150, PIN = 34, PH = 66, ROOF = 128;
  var CROWN_TDC = CY - (R + L) - PIN;                 // 148
  var IC = { x: 184, y: 30, open: -10, close: 220 }, EC = { x: 256, y: 30, open: 500, close: 730 };
  IC.c = (IC.open + IC.close) / 2; EC.c = (EC.open + EC.close) / 2;   // lobe centers in crank degrees
  IC.hw = (IC.close - IC.open) / 4; EC.hw = (EC.close - EC.open) / 4; // half-width in cam degrees
  var RB = 15, LMAX = 15, SPARK = 345;
  var rad = Math.PI / 180;

  function wrap180(a) { a = ((a % 360) + 360) % 360; return a > 180 ? a - 360 : a; }
  function lobe(a, hw) { return Math.abs(a) >= hw ? 0 : Math.pow(Math.cos(Math.PI * a / (2 * hw)), 2); }
  function camAngle(th, cam) { return wrap180((th - cam.c) / 2); }
  function lift(th, cam) { return LMAX * lobe(camAngle(th, cam), cam.hw); }
  function pinY(th) { var s = Math.sin(th * rad), c = Math.cos(th * rad); return CY - (R * c + Math.sqrt(L * L - R * R * s * s)); }

  // ----- build the widget -----
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 440 500', role: 'img', 'aria-label': 'Cross-section of one cylinder of a four-stroke engine, animated', class: 'tr-eng' }, stage);
  var defs = S('defs', null, svg);
  defs.innerHTML = '<radialGradient id="eng-flame"><stop offset="0" stop-color="#fff3b0"/><stop offset=".45" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff6a2b" stop-opacity=".0"/></radialGradient>' +
    '<marker id="eng-ar" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="e-arh"/></marker>';

  function part(key, name, parent) {
    var g = S('g', { 'data-part': key, tabindex: '0', role: 'button', 'aria-label': name }, parent || svg);
    return g;
  }
  // block, crankcase and oil pan
  var gBlock = part('cylinder', 'Cylinder and engine block');
  S('path', { class: 'e-block', d: 'M120,131 H152 V330 H120 Z M288,131 H320 V330 H288 Z' }, gBlock);
  S('path', { class: 'e-case', d: 'M126,331 L104,372 V452 H336 V372 L314,331' }, gBlock);
  var gJacket = part('jacket', 'Water jacket');
  S('path', { class: 'e-jacket', d: 'M126,140 H141 V312 H126 Z M299,140 H314 V312 H299 Z' }, gJacket);
  var gPan = part('pan', 'Oil pan');
  S('path', { class: 'e-oil', d: 'M98,470 H342 V486 Q342,492 336,492 H104 Q98,492 98,486 Z' }, gPan);
  S('path', { class: 'e-pan', d: 'M92,456 V488 Q92,496 100,496 H340 Q348,496 348,488 V456' }, gPan);
  // gas in the cylinder
  var gGas = part('chamber', 'Combustion chamber');
  var gas = S('rect', { class: 'e-gas', x: 152, y: ROOF, width: 136, height: 20 }, gGas);
  var flame = S('circle', { cx: 220, cy: 134, r: 0, fill: 'url(#eng-flame)', opacity: 0 }, gGas);
  // head with ports
  var gHead = part('head', 'Cylinder head');
  S('path', { class: 'e-head', d: 'M110,58 H330 V128 H273 L262,118 H250 L239,128 H201 L190,118 H178 L167,128 H110 Z' }, gHead);
  var gGasket = part('gasket', 'Head gasket');
  S('rect', { class: 'e-gasket', x: 110, y: 128, width: 42, height: 3 }, gGasket);
  S('rect', { class: 'e-gasket', x: 288, y: 128, width: 42, height: 3 }, gGasket);
  var gIP = part('iport', 'Intake port');
  S('path', { class: 'e-port-in', d: 'M0,84 H150 Q176,86 182,116 L172,124 Q164,104 148,108 H0 Z' }, gIP);
  var gEP = part('eport', 'Exhaust port');
  S('path', { class: 'e-port-ex', d: 'M440,84 H290 Q264,86 258,116 L268,124 Q276,104 292,108 H440 Z' }, gEP);
  // particles
  var pIn = S('path', { d: 'M4,96 L146,96 Q172,98 180,118 L184,150', fill: 'none', stroke: 'none' }, svg);
  var pEx = S('path', { d: 'M256,150 L260,118 Q268,98 294,96 L436,96', fill: 'none', stroke: 'none' }, svg);
  var lenIn = pIn.getTotalLength ? pIn.getTotalLength() : 200, lenEx = pEx.getTotalLength ? pEx.getTotalLength() : 200;
  var dotsIn = [], dotsEx = [], i;
  for (i = 0; i < 12; i++) {
    dotsIn.push({ el: S('circle', { r: 3, class: 'e-pin-in', opacity: 0 }, svg), t: i / 12 });
    dotsEx.push({ el: S('circle', { r: 3, class: 'e-pex', opacity: 0 }, svg), t: i / 12 });
  }
  // valves (stem, head, bucket) and springs
  function valve(key, name, x) {
    var g = part(key, name);
    var inner = S('g', null, g);
    S('rect', { class: 'e-valve', x: x - 3, y: 56, width: 6, height: 66 }, inner);
    S('path', { class: 'e-valve', d: 'M' + (x - 4) + ',120 L' + (x - 17) + ',128 H' + (x + 17) + ' L' + (x + 4) + ',120 Z' }, inner);
    S('rect', { class: 'e-bucket', x: x - 11, y: 45, width: 22, height: 11, rx: 2 }, inner);
    return inner;
  }
  var vIn = valve('ivalve', 'Intake valve', IC.x), vEx = valve('evalve', 'Exhaust valve', EC.x);
  var gSpr = part('springs', 'Valve springs');
  var sprIn = S('path', { class: 'e-spring' }, gSpr), sprEx = S('path', { class: 'e-spring' }, gSpr);
  function springPath(x, top) { var bot = 84, n = 7, h = (bot - top) / n, d = 'M' + (x - 9) + ',' + top; for (var k = 1; k <= n; k++) d += ' L' + (k % 2 ? x + 9 : x - 9) + ',' + (top + k * h); return d; }
  // camshafts
  function camPath(hw) {
    var d = '';
    for (var a = -180; a <= 180; a += 6) {
      var r = RB + LMAX * lobe(a, hw), x = r * Math.sin(-a * rad), y = r * Math.cos(a * rad);
      d += (a === -180 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    return d + 'Z';
  }
  function cam(key, name, c) {
    var g = part(key, name);
    var rot = S('g', null, g);
    S('path', { class: 'e-cam', d: camPath(c.hw) }, rot);
    S('circle', { class: 'e-camc', cx: 0, cy: 0, r: 4 }, rot);
    return rot;
  }
  var cIn = cam('icam', 'Intake camshaft', IC), cEx = cam('ecam', 'Exhaust camshaft', EC);
  // spark plug
  var gPlug = part('plug', 'Spark plug');
  S('path', { class: 'e-plug-ins', d: 'M213,62 H227 V104 H213 Z' }, gPlug);
  S('path', { class: 'e-plug-m', d: 'M209,104 H231 V116 H209 Z M218,116 H222 V128 H218 Z M216,130 H224 V132 H216 Z' }, gPlug);
  var spark = S('path', { class: 'e-spark', d: 'M220,128 l-9,-6 M220,128 l9,-6 M220,131 l-11,4 M220,131 l11,4 M220,133 l-4,9 M220,133 l4,9', opacity: 0 }, svg);
  // piston, rings, wrist pin
  var gPiston = part('piston', 'Piston');
  var piston = S('g', null, gPiston);
  S('rect', { class: 'e-piston', x: 154, y: CROWN_TDC, width: 132, height: PH, rx: 3 }, piston);
  var arrow = S('text', { class: 'e-dir', x: 196, y: CROWN_TDC + 54, 'text-anchor': 'middle' }, piston);
  var gRings = part('rings', 'Piston rings');
  var rings = S('g', null, gRings);
  [8, 15, 22].forEach(function (o) { S('path', { class: 'e-ring', d: 'M154,' + (CROWN_TDC + o) + ' H286' }, rings); });
  var gRod = part('rod', 'Connecting rod');
  var rod = S('line', { class: 'e-rod', x1: CX, y1: 0, x2: CX, y2: 0 }, gRod);
  var rod2 = S('line', { class: 'e-rod2', x1: CX, y1: 0, x2: CX, y2: 0 }, gRod);
  var gPin = part('pin', 'Wrist pin');
  var wpin = S('circle', { class: 'e-pinc', cx: CX, cy: 0, r: 8 }, gPin);
  // crankshaft with counterweight
  var gCW = part('counter', 'Crankshaft counterweight');
  var cw = S('path', { class: 'e-cw', d: 'M' + (CX - 50) + ',' + CY + ' A50,50 0 0 0 ' + (CX + 50) + ',' + CY + ' Z' }, gCW);
  var gCrank = part('crank', 'Crankshaft');
  var crank = S('g', null, gCrank);
  S('path', { class: 'e-crank', d: 'M' + (CX - 16) + ',' + CY + ' V' + (CY - R) + ' A16,16 0 0 1 ' + (CX + 16) + ',' + (CY - R) + ' V' + CY + ' Z' }, crank);
  S('circle', { class: 'e-crank', cx: CX, cy: CY, r: 15 }, crank);
  S('circle', { class: 'e-crankpin', cx: CX, cy: CY - R, r: 10 }, crank);
  // timing drive inset (cam sprocket twice the crank sprocket)
  var gBelt = part('belt', 'Timing belt or chain');
  S('rect', { class: 'e-inset', x: 360, y: 290, width: 76, height: 160, rx: 8 }, gBelt);
  S('path', { class: 'e-belt', d: 'M388,332 L388,412 A10,10 0 0 0 408,412 L418,332 A20,20 0 0 0 378,332' }, gBelt);
  var sprCam = S('g', null, gBelt), sprCrank = S('g', null, gBelt);
  S('circle', { class: 'e-spr', cx: 0, cy: 0, r: 20 }, sprCam); S('path', { class: 'e-sprm', d: 'M0,0 V-17' }, sprCam);
  S('circle', { class: 'e-spr', cx: 0, cy: 0, r: 10 }, sprCrank); S('path', { class: 'e-sprm', d: 'M0,0 V-8' }, sprCrank);
  S('text', { class: 'e-tiny', x: 398, y: 305, 'text-anchor': 'middle' }, gBelt).textContent = 'cam';
  S('text', { class: 'e-tiny', x: 398, y: 440, 'text-anchor': 'middle' }, gBelt).textContent = 'crank';

  // labels (toggle)
  var gLab = S('g', { class: 'e-labels', 'aria-hidden': 'true' }, svg);
  [['intake cam', 150, 16, 'end', 172, 22], ['exhaust cam', 290, 16, 'start', 268, 22], ['spark plug', 300, 52, 'start', 228, 66],
   ['intake port', 4, 124, 'start'], ['exhaust port', 436, 124, 'end'], ['valve spring', 100, 66, 'end', 175, 70],
   ['intake valve', 104, 146, 'end', 170, 128], ['exhaust valve', 336, 146, 'start', 272, 128],
   ['cylinder wall', 104, 230, 'end', 124, 230], ['water jacket', 336, 230, 'start', 306, 230],
   ['piston', 104, 190, 'end', 154, 190], ['connecting rod', 104, 300, 'end', 205, 300], ['crankshaft', 104, 420, 'end', 182, 404],
   ['oil pan', 336, 484, 'start'], ['timing belt', 432, 466, 'end']].forEach(function (l) {
    var t = S('text', { class: 'e-lab', x: l[1], y: l[2], 'text-anchor': l[3] }, gLab); t.textContent = l[0];
    if (l.length > 4) S('path', { class: 'e-lead', d: 'M' + (l[3] === 'end' ? l[1] + 3 : l[3] === 'start' ? l[1] - 3 : l[1]) + ',' + (l[2] - 4) + ' L' + l[4] + ',' + l[5] }, gLab);
  });
  gLab.style.display = 'none';
  var sLabel = S('text', { class: 'e-stroke', x: 8, y: 40 }, svg);

  // ----- side panel -----
  var STROKES = [
    ['Intake', 'The intake valve is open and the piston moves down, drawing air and fuel into the cylinder. The valve opened a little before the top and stays open past the bottom so moving air keeps ramming in.'],
    ['Compression', 'Both valves are closed. The piston moves up and squeezes the mixture into the small space at the top. Just before the top, the spark plug fires.'],
    ['Power', 'The burning gas gets very hot and its pressure shoves the piston down. This is the only stroke that makes power. Near the bottom, the exhaust valve opens early so the pressure can blow the gas out.'],
    ['Exhaust', 'The exhaust valve is open and the piston moves up, pushing the burned gas out. Near the top, both valves are open for a moment: valve overlap.']];
  var PARTS = {
    cylinder: ['Cylinder (in the block)', 'The round bore the piston slides in. The block is the engine’s frame.'],
    jacket: ['Water jacket', 'Passages around the cylinder where coolant picks up heat (Lesson 4).'],
    pan: ['Oil pan', 'Holds the engine oil. The oil pump draws from here.'],
    chamber: ['Combustion chamber', 'The small space above the piston at the top of its stroke, where the mixture burns.'],
    head: ['Cylinder head', 'Caps the cylinder and holds the valves, spark plug and camshafts.'],
    gasket: ['Head gasket', 'Seals the head to the block, keeping gas, coolant and oil in their own passages.'],
    iport: ['Intake port', 'Carries air and fuel from the intake manifold to the intake valve.'],
    eport: ['Exhaust port', 'Carries burned gas from the exhaust valve to the exhaust manifold.'],
    ivalve: ['Intake valve', 'Opens to let air and fuel in, then seals the cylinder.'],
    evalve: ['Exhaust valve', 'Opens to let the burned gas out.'],
    springs: ['Valve springs', 'Snap the valves shut after the cam lobe passes.'],
    icam: ['Intake camshaft', 'Its lobe pushes the intake valve open. It turns once for every two turns of the crankshaft.'],
    ecam: ['Exhaust camshaft', 'Its lobe pushes the exhaust valve open, also at half the crankshaft’s speed.'],
    plug: ['Spark plug', 'Fires just before the piston reaches the top of the compression stroke, lighting the mixture.'],
    piston: ['Piston', 'Takes the push of the burning gas and slides up and down in the cylinder.'],
    rings: ['Piston rings', 'Seal the gap to the cylinder wall and scrape oil off it: two compression rings and one oil ring on most engines.'],
    rod: ['Connecting rod', 'Links the piston to the crankshaft.'],
    pin: ['Wrist pin', 'The pivot joining the piston to the connecting rod.'],
    crank: ['Crankshaft', 'Turns the piston’s up-and-down push into rotation. It turns twice per four-stroke cycle.'],
    counter: ['Counterweight', 'Balances the weight of the crank throw and rod so the engine runs smoothly.'],
    belt: ['Timing belt or chain', 'Links the crankshaft to the camshafts. The cam sprocket is twice the size of the crank sprocket, so the cams turn at half speed.']
  };
  side.innerHTML =
    '<div class="tr-stroke"><b class="eng-sname">1 · Intake</b><span class="eng-angle"></span></div>' +
    '<p class="eng-sdesc" style="margin:.2rem 0 .4rem;line-height:1.5"></p>' +
    '<div class="tr-cycle" role="group" aria-label="Jump to a stroke"><span class="c1" role="button" tabindex="0" data-s="0">1 Intake</span><span class="c2" role="button" tabindex="0" data-s="1">2 Compress</span><span class="c3" role="button" tabindex="0" data-s="2">3 Power</span><span class="c4" role="button" tabindex="0" data-s="3">4 Exhaust</span></div>' +
    '<p class="eng-state hs-small" style="margin:.3rem 0"></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn pri eng-play" aria-pressed="false">▶ Play</button>' +
    '<button type="button" class="hs-btn eng-back" aria-label="Step back to the previous stroke">◂ Step</button>' +
    '<button type="button" class="hs-btn eng-step" aria-label="Step to the next stroke">Step ▸</button>' +
    '<button type="button" class="hs-btn ghost eng-lab" aria-pressed="false">Labels</button></div>' +
    '<label class="tr-field">Turn the crank by hand: <span class="v eng-av">0°</span><input type="range" class="eng-range" min="0" max="719" step="1" value="0" aria-label="Crank angle in degrees, 0 to 720"></label>' +
    '<div class="tr-field"><span>Speed</span><div class="tr-seg eng-speed" role="group" aria-label="Animation speed"><button type="button" data-v="0.25">¼×</button><button type="button" data-v="0.5">½×</button><button type="button" data-v="1" aria-pressed="true">1×</button><button type="button" data-v="2">2×</button></div></div>' +
    '<div class="tr-partname" aria-live="polite"><b>Tap any part</b> of the engine to see its name and job.</div>' +
    '<p class="hs-small eng-key"><span style="color:#2f80c4">■</span> air and fuel &nbsp; <span style="color:#ff8a3d">■</span> burning &nbsp; <span style="color:#7a7f86">■</span> exhaust</p>';
  var elName = side.querySelector('.eng-sname'), elAng = side.querySelector('.eng-angle'), elDesc = side.querySelector('.eng-sdesc'),
    elState = side.querySelector('.eng-state'), btnPlay = side.querySelector('.eng-play'), range = side.querySelector('.eng-range'),
    elAv = side.querySelector('.eng-av'), elPart = side.querySelector('.tr-partname'), cyc = side.querySelectorAll('.tr-cycle span');

  // ----- state and drawing -----
  var th = T.reduced ? 30 : 0, playing = !T.reduced, speed = 1, lastStroke = -1, dragging = false, sel = null;
  function mixColor(a, b, t) {
    var pa = [parseInt(a.substr(1, 2), 16), parseInt(a.substr(3, 2), 16), parseInt(a.substr(5, 2), 16)],
      pb = [parseInt(b.substr(1, 2), 16), parseInt(b.substr(3, 2), 16), parseInt(b.substr(5, 2), 16)];
    return 'rgb(' + pa.map(function (v, k) { return Math.round(v + (pb[k] - v) * t); }).join(',') + ')';
  }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function draw() {
    var t = ((th % 720) + 720) % 720, tc = t % 360;
    var yp = pinY(t), crown = yp - PIN, dy = crown - CROWN_TDC;
    piston.setAttribute('transform', 'translate(0,' + dy.toFixed(2) + ')');
    rings.setAttribute('transform', 'translate(0,' + dy.toFixed(2) + ')');
    var px = CX + R * Math.sin(t * rad), py = CY - R * Math.cos(t * rad);
    [rod, rod2].forEach(function (l) { l.setAttribute('y1', yp.toFixed(2)); l.setAttribute('x2', px.toFixed(2)); l.setAttribute('y2', py.toFixed(2)); });
    wpin.setAttribute('cy', yp.toFixed(2));
    crank.setAttribute('transform', 'rotate(' + t.toFixed(2) + ' ' + CX + ' ' + CY + ')');
    cw.setAttribute('transform', 'rotate(' + t.toFixed(2) + ' ' + CX + ' ' + CY + ')');
    var li = lift(t, IC), le = lift(t, EC);
    vIn.setAttribute('transform', 'translate(0,' + li.toFixed(2) + ')');
    vEx.setAttribute('transform', 'translate(0,' + le.toFixed(2) + ')');
    sprIn.setAttribute('d', springPath(IC.x, 57 + li)); sprEx.setAttribute('d', springPath(EC.x, 57 + le));
    cIn.setAttribute('transform', 'translate(' + IC.x + ',' + IC.y + ') rotate(' + camAngle(t, IC).toFixed(2) + ')');
    cEx.setAttribute('transform', 'translate(' + EC.x + ',' + EC.y + ') rotate(' + camAngle(t, EC).toFixed(2) + ')');
    sprCam.setAttribute('transform', 'translate(398,332) rotate(' + (t / 2).toFixed(2) + ')');
    sprCrank.setAttribute('transform', 'translate(398,412) rotate(' + t.toFixed(2) + ')');
    // gas
    var hgt = crown - ROOF, Vmax = (CROWN_TDC + 96) - ROOF, Vmin = CROWN_TDC - ROOF, dens = (Vmax / hgt - 1) / (Vmax / Vmin - 1);
    var col, op, fl = 0;
    if (t < 220 || t >= 712) { col = '#2f80c4'; op = 0.22 + 0.2 * Math.min(1, t / 220); if (t >= 712) { col = mixColor('#7a7f86', '#2f80c4', (t - 712) / 8); op = 0.3; } }
    else if (t < SPARK) { col = '#2f80c4'; op = clamp(0.3 + 0.55 * dens, 0.3, 0.85); }
    else if (t < 360) { col = '#3a6fc0'; op = 0.85; }
    else if (t < 420) { var k = (t - 360) / 60; col = mixColor('#ffd166', '#ff7b39', k); op = 0.92; fl = 1 - k; }
    else if (t < 500) { col = mixColor('#ff7b39', '#9a6a55', (t - 420) / 80); op = 0.85 - 0.2 * (t - 420) / 80; }
    else { col = mixColor('#9a6a55', '#7a7f86', clamp((t - 500) / 60, 0, 1)); op = 0.62 - 0.32 * clamp((t - 540) / 172, 0, 1); }
    gas.setAttribute('height', Math.max(0, hgt).toFixed(2)); gas.setAttribute('fill', col); gas.setAttribute('fill-opacity', op.toFixed(2));
    var sp = t >= SPARK && t < 362;
    spark.setAttribute('opacity', sp ? (0.6 + 0.4 * Math.abs(Math.sin(t * 2))).toFixed(2) : 0);
    if (t >= 356 && t < 420) { var fr = 8 + 110 * clamp((t - 356) / 40, 0, 1); flame.setAttribute('r', fr.toFixed(1)); flame.setAttribute('cy', (ROOF + 6).toFixed(1)); flame.setAttribute('opacity', (0.9 * (t < 360 ? 1 : fl + 0.15)).toFixed(2)); }
    else flame.setAttribute('opacity', 0);
    // labels and text
    var s = Math.floor(t / 180);
    arrow.textContent = (s % 2 === 0) ? '▼' : '▲';
    sLabel.textContent = (s + 1) + ' · ' + STROKES[s][0].toUpperCase();
    if (s !== lastStroke) {
      lastStroke = s;
      elName.textContent = (s + 1) + ' · ' + STROKES[s][0] + ' stroke';
      elDesc.textContent = STROKES[s][1];
      cyc.forEach(function (c, k) { c.classList.toggle('on', k === s); });
    }
    elAng.textContent = 'crank ' + Math.round(t) + '° of 720° · cams ' + Math.round(t / 2) + '°';
    elState.textContent = 'Intake valve: ' + (li > 0.3 ? 'open' : 'closed') + ' · Exhaust valve: ' + (le > 0.3 ? 'open' : 'closed') + (sp ? ' · Spark!' : '');
    if (!dragging) range.value = Math.round(t) % 720;
    elAv.textContent = Math.round(t) + '°';
    return { li: li, le: le };
  }
  function flow(dt, st) {
    function run(list, len, path, open, rate) {
      list.forEach(function (d) {
        if (open > 0.3) { d.t += dt * rate * (open / LMAX); if (d.t > 1) d.t -= 1; }
        var p = path.getPointAtLength ? path.getPointAtLength(d.t * len) : { x: 0, y: 0 };
        d.el.setAttribute('cx', p.x.toFixed(1)); d.el.setAttribute('cy', p.y.toFixed(1));
        d.el.setAttribute('opacity', open > 0.3 ? (Math.min(1, d.t * 6, (1 - d.t) * 6) * 0.9).toFixed(2) : 0);
      });
    }
    var rate = 0.9 * speed;
    run(dotsIn, lenIn, pIn, st.li, rate); run(dotsEx, lenEx, pEx, st.le, rate);
  }
  var lp = T.loop(root, function (dt) {
    if (playing) th = (th + dt * 120 * speed) % 720;
    var st = draw();
    flow(playing && !T.reduced ? dt : 0, st);
    if (!playing) lp.stop();
  });
  function redraw() { var st = draw(); flow(0, st); }
  function setPlay(p) {
    playing = p;
    btnPlay.setAttribute('aria-pressed', p ? 'true' : 'false');
    btnPlay.textContent = p ? '❚❚ Pause' : '▶ Play';
    if (p) lp.start(); else { lp.stop(); redraw(); }
  }
  btnPlay.addEventListener('click', function () { setPlay(!playing); });
  side.querySelector('.eng-step').addEventListener('click', function () { setPlay(false); th = (Math.floor(th / 180 + 1e-6) + 1) * 180 % 720; redraw(); });
  side.querySelector('.eng-back').addEventListener('click', function () { setPlay(false); var b = Math.floor(th / 180 + 1e-6) * 180; th = (th - b < 1 ? b - 180 + 720 : b) % 720; redraw(); });
  var bl = side.querySelector('.eng-lab');
  bl.addEventListener('click', function () { var on = gLab.style.display === 'none'; gLab.style.display = on ? '' : 'none'; bl.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  range.addEventListener('input', function () { dragging = true; setPlay(false); th = +range.value; redraw(); dragging = false; });
  side.querySelectorAll('.eng-speed button').forEach(function (b) {
    b.addEventListener('click', function () {
      speed = +b.dataset.v;
      side.querySelectorAll('.eng-speed button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  });
  cyc.forEach(function (c) {
    function go() { setPlay(false); th = +c.dataset.s * 180 + 1; redraw(); }
    c.addEventListener('click', go);
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function pick(e) {
      if (e) e.stopPropagation();
      if (sel) sel.classList.remove('sel');
      sel = g; g.classList.add('sel');
      var p = PARTS[g.dataset.part];
      elPart.innerHTML = '';
      var b = D.createElement('b'); b.textContent = p[0] + ': '; elPart.appendChild(b); elPart.appendChild(D.createTextNode(p[1]));
    }
    g.addEventListener('click', pick);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(e); } });
  });
  redraw();
  setPlay(playing);
})(window, document);
