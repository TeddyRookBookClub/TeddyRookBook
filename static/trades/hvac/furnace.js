/* HVAC course, Lesson 3: the start-up sequence of an induced-draft gas furnace with a hot-surface igniter, step by step,
   and what happens when a safety can't prove itself (blocked vent: pressure switch; dirty flame sensor; clogged filter:
   high-limit switch). Typical sequence only: parts, order and timing vary by model (see the installation manual).
   Sources: U.S. DOE Energy Saver (Furnaces and Boilers), ENERGY STAR maintenance checklist. No timing numbers are modeled. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-furnace');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 460 412', role: 'img', class: 'hv-fu', 'aria-label': 'Cutaway of a gas furnace: thermostat, control board, draft inducer and vent, pressure switch, gas valve, burners, igniter, flame sensor, heat exchanger, high-limit switch, blower and filter' }, stage);
  svg.innerHTML = '<defs><marker id="fu-a" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fu-ah"/></marker>' +
    '<marker id="fu-c" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fu-ac"/></marker></defs>';
  function part(key, name) { return S('g', { 'data-part': key, tabindex: 0, role: 'button', 'aria-label': name }, svg); }
  function txt(x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, class: cls || 'hv-ts', 'text-anchor': anchor || 'start' }, svg); t.textContent = s; return t; }
  function lead(x1, y1, x2, y2) { S('path', { class: 'fu-lead', d: 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 }, svg); }

  // cabinet and plenum
  S('rect', { class: 'fu-cab', x: 120, y: 62, width: 220, height: 340, rx: 6 }, svg);
  S('path', { class: 'fu-div', d: 'M120,250 H340' }, svg);
  // house-air arrows (over the cabinet, under the parts)
  var airG = S('g', { class: 'fu-airg' }, svg), airArrows = [];
  [176, 210, 244].forEach(function (x) { airArrows.push(S('path', { class: 'fu-air', d: 'M' + x + ',300 V74', 'marker-end': 'url(#fu-a)' }, airG)); });
  var outArrows = [];
  [170, 205, 240].forEach(function (x) { outArrows.push(S('path', { class: 'fu-air', d: 'M' + x + ',24 V6', 'marker-end': 'url(#fu-a)' }, airG)); });
  var retArrows = [];
  [326, 356, 386].forEach(function (y) { retArrows.push(S('path', { class: 'fu-air fu-cool', d: 'M28,' + y + ' H98', 'marker-end': 'url(#fu-c)' }, airG)); });
  var gPlen = part('plenum', 'Supply plenum');
  S('rect', { class: 'fu-plen', x: 130, y: 24, width: 150, height: 38, rx: 3 }, gPlen);
  txt(205, 47, 'to the supply ducts', 'hv-ts', 'middle');
  // heat exchanger
  var gHx = part('hx', 'Heat exchanger'), hxShells = [];
  [146, 180, 214, 248].forEach(function (x) { hxShells.push(S('rect', { class: 'fu-hx', x: x, y: 82, width: 26, height: 116, rx: 12 }, gHx)); });
  S('rect', { class: 'fu-coll', x: 146, y: 70, width: 150, height: 10, rx: 3 }, gHx);
  // flue particles inside the heat exchanger and vent
  var flueG = S('g', null, svg), flue = [];
  for (var i = 0; i < 14; i++) flue.push({ el: S('circle', { class: 'fu-fp', r: 2.4 }, flueG), t: i / 14, lane: i % 5 });
  // burners and flames
  var gBur = part('burners', 'Burners');
  S('path', { class: 'fu-man', d: 'M146,224 H284' }, gBur);
  var flames = [];
  [159, 193, 227, 261].forEach(function (cx) {
    S('rect', { class: 'fu-bur', x: cx - 10, y: 204, width: 20, height: 12, rx: 3 }, gBur);
    flames.push(S('path', { class: 'fu-flame', d: 'M' + (cx - 8) + ',204 Q' + cx + ',170 ' + (cx + 8) + ',204 Z', opacity: 0 }, gBur));
  });
  // gas valve and supply
  var gGv = part('gv', 'Gas valve');
  S('path', { class: 'fu-gpipe', d: 'M10,224 H126' }, gGv);
  S('rect', { class: 'fu-gv', x: 124, y: 214, width: 24, height: 20, rx: 3 }, gGv);
  var gasG = S('g', null, svg), gasDots = [];
  for (var g = 0; g < 9; g++) gasDots.push({ el: S('circle', { class: 'fu-gd', r: 2.2, opacity: 0 }, gasG), t: g / 9 });
  txt(12, 216, 'gas supply', 'hv-ts');
  // igniter
  var gIgn = part('ign', 'Igniter');
  var ign = S('rect', { class: 'fu-ign', x: 168, y: 186, width: 5, height: 18, rx: 2 }, gIgn);
  // flame sensor
  var gSen = part('sensor', 'Flame sensor');
  var sen = S('path', { class: 'fu-sen', d: 'M276,214 V194 L268,188' }, gSen);
  var senDot = S('circle', { class: 'fu-ind0', cx: 276, cy: 216, r: 4 }, gSen);
  // high-limit switch
  var gLim = part('limit', 'High-limit switch');
  var lim = S('circle', { class: 'fu-lim', cx: 300, cy: 176, r: 8 }, gLim);
  // inducer and vent
  var gVent = part('vent', 'Vent pipe');
  S('path', { class: 'fu-vent', d: 'M312,86 V4' }, gVent);
  var block = S('path', { class: 'fu-block', d: 'M300,6 L324,22 M324,6 L300,22', opacity: 0 }, gVent);
  var gInd = part('inducer', 'Draft inducer');
  S('rect', { class: 'fu-indh', x: 296, y: 84, width: 32, height: 32, rx: 8 }, gInd);
  var indBl = S('g', null, gInd);
  for (var b = 0; b < 4; b++) S('path', { class: 'fu-indb', d: 'M312,100 L312,89', transform: 'rotate(' + (b * 90) + ' 312 100)' }, indBl);
  // pressure switch
  var gPsw = part('psw', 'Pressure switch');
  S('path', { class: 'fu-hose', d: 'M318,140 V116' }, gPsw);
  S('rect', { class: 'fu-psw', x: 300, y: 140, width: 34, height: 22, rx: 4 }, gPsw);
  var pswDot = S('circle', { class: 'fu-ind0', cx: 326, cy: 151, r: 4 }, gPsw);
  var pswArm = S('path', { class: 'fu-arm', d: 'M306,151 L318,145' }, gPsw);
  // control board
  var gBoard = part('board', 'Control board');
  S('rect', { class: 'fu-board', x: 130, y: 262, width: 68, height: 36, rx: 3 }, gBoard);
  S('path', { class: 'fu-chip', d: 'M140,272 h20 v12 h-20 z M166,286 h10' }, gBoard);
  var led = S('circle', { class: 'fu-led', cx: 188, cy: 271, r: 4 }, gBoard);
  // blower
  var gBlow = part('blower', 'Blower');
  S('circle', { class: 'fu-blw', cx: 248, cy: 340, r: 42 }, gBlow);
  var blBl = S('g', null, gBlow);
  for (var k = 0; k < 10; k++) S('path', { class: 'fu-blb', d: 'M248,306 q8,6 6,14', transform: 'rotate(' + (k * 36) + ' 248 340)' }, blBl);
  S('circle', { class: 'fu-blm', cx: 248, cy: 340, r: 12 }, gBlow);
  // filter
  var gFil = part('filter', 'Filter');
  var fil = S('rect', { class: 'fu-fil', x: 104, y: 304, width: 12, height: 94, rx: 2 }, gFil);
  for (var f2 = 0; f2 < 7; f2++) S('path', { class: 'fu-filh', d: 'M104,' + (310 + f2 * 13) + ' l12,6' }, gFil);
  // thermostat
  var gTh = part('thermo', 'Thermostat');
  S('rect', { class: 'fu-th', x: 16, y: 40, width: 58, height: 70, rx: 9 }, gTh);
  S('circle', { class: 'fu-thd', cx: 45, cy: 70, r: 16 }, gTh);
  var thTxt = S('text', { class: 'hv-tag', x: 45, y: 74, 'text-anchor': 'middle' }, gTh); thTxt.textContent = 'HEAT';
  var wire = S('path', { class: 'fu-wire', d: 'M74,96 H117 V280 H130' }, svg);
  txt(45, 124, 'thermostat', 'hv-ts', 'middle'); txt(80, 90, 'R–W', 'hv-tag fu-wl');
  // labels with leaders
  txt(350, 22, 'vent to outdoors', 'hv-ts'); lead(348, 19, 318, 28);
  txt(350, 104, 'draft inducer', 'hv-ts'); lead(348, 101, 330, 100);
  txt(350, 152, 'pressure switch', 'hv-ts'); lead(348, 149, 336, 151);
  txt(350, 180, 'high-limit switch', 'hv-ts'); lead(348, 177, 309, 176);
  txt(350, 204, 'flame sensor', 'hv-ts'); lead(348, 201, 280, 200);
  txt(350, 228, 'burners', 'hv-ts'); lead(348, 225, 286, 224);
  txt(350, 344, 'blower', 'hv-ts'); lead(348, 341, 291, 341);
  txt(113, 132, 'heat', 'hv-ts', 'end'); txt(113, 144, 'exchanger', 'hv-ts', 'end'); lead(115, 138, 146, 138);
  txt(113, 186, 'igniter', 'hv-ts', 'end'); lead(115, 183, 167, 192);
  txt(112, 248, 'gas valve', 'hv-ts', 'end'); lead(114, 245, 126, 233);
  txt(98, 296, 'filter', 'hv-ts', 'end');
  txt(164, 314, 'control board', 'hv-ts', 'middle');
  txt(28, 318, 'room air in', 'hv-ts');
  var tState = txt(230, 410, '', 'hv-tag fu-state', 'middle');

  // ---------- steps ----------
  var CHIPS = ['Call', 'Inducer', 'Prove draft', 'Ignite', 'Gas on', 'Prove flame', 'Heat up', 'Blower', 'Satisfied', 'Run-on'];
  var base = { thermo: 0, led: 'off', inducer: 0, flue: 0, psw: 'open', ign: 0, gas: 0, flame: 0, sensor: 'none', hx: 0, blower: 0, limit: 'closed', block: 0 };
  function st(o) { var r = {}; for (var k in base) r[k] = base[k]; for (var k2 in o) r[k2] = o[k2]; return r; }
  var RUN = { thermo: 1, led: 'on', inducer: 1, flue: 1, psw: 'ok' };
  function plus(a, b) { var r = {}; for (var k in a) r[k] = a[k]; for (var k2 in b) r[k2] = b[k2]; return r; }
  var N = [
    { chip: -1, text: '<b>Standby.</b> The thermostat is satisfied, so nothing runs. Press Play, or Step through it.', s: st({}) },
    { chip: 0, text: '<b>Call for heat.</b> The room has cooled below the setting, so the thermostat connects R to W. A 24-volt signal reaches the control board, which starts the sequence.', s: st({ thermo: 1, led: 'on' }) },
    { chip: 1, text: '<b>Inducer starts.</b> The draft inducer fan pulls air through the heat exchanger and pushes it out the vent, clearing out any leftover gases.', s: st({ thermo: 1, led: 'on', inducer: 1, flue: 1 }) },
    { chip: 2, text: '<b>Pressure switch proves the draft.</b> The switch senses the suction the inducer makes and closes only if air is really moving through the vent. Now the board knows the exhaust has a way out.', s: st(RUN) },
    { chip: 3, text: '<b>Ignition.</b> The hot-surface igniter heats up until it glows bright orange, hot enough to light gas.', s: st(plus(RUN, { ign: 1 })) },
    { chip: 4, text: '<b>Gas valve opens.</b> Gas flows to the burners and lights off the glowing igniter. The flames reach into the heat exchanger.', s: st(plus(RUN, { ign: 1, gas: 1, flame: 1 })) },
    { chip: 5, text: '<b>Flame sensor proves the flame.</b> A tiny current flows through the flame to the sensor rod; only a real flame completes that circuit. With proof, the board keeps the gas on and switches the igniter off.', s: st(plus(RUN, { gas: 1, flame: 1, sensor: 'ok', hx: 0.3 })) },
    { chip: 6, text: '<b>Heat exchanger warms.</b> Hot combustion gases flow through the heat exchanger and out the vent. The blower waits a short time so it won’t blow cold air at you.', s: st(plus(RUN, { gas: 1, flame: 1, sensor: 'ok', hx: 0.8 })) },
    { chip: 7, text: '<b>Blower starts.</b> Room air comes in through the filter, flows across the hot outside of the heat exchanger and up into the ducts. The air you breathe and the combustion gases never mix.', s: st(plus(RUN, { gas: 1, flame: 1, sensor: 'ok', hx: 1, blower: 1 })) },
    { chip: 8, text: '<b>Thermostat satisfied.</b> The room reaches the setting and the thermostat opens the W circuit. The gas valve closes and the flames go out. The inducer runs a little longer to clear the vent.', s: st({ led: 'on', inducer: 1, flue: 1, psw: 'ok', hx: 0.6, blower: 1 }) },
    { chip: 9, text: '<b>Blower run-on.</b> The blower keeps going to pull the leftover heat out of the heat exchanger, then stops, and the furnace waits for the next call.', s: st({ led: 'on', hx: 0.25, blower: 1 }) }
  ];
  var FAULTS = {
    none: N,
    vent: N.slice(0, 3).concat([
      { chip: 2, bad: true, text: '<b>No proof of draft.</b> The vent is blocked, by snow, a bird’s nest or a disconnected pipe, so the inducer can’t make the suction the switch waits for. The pressure switch stays open, and the board never lights the igniter or opens the gas valve.', s: st({ thermo: 1, led: 'fault', inducer: 1, block: 1, psw: 'fail' }) },
      { chip: 2, bad: true, text: '<b>No heat, but no danger from this.</b> The board stops, may retry after a pause, and on many furnaces blinks a fault code that the manual explains. Clearing snow from around the outdoor vent is something you can do; anything more is for a technician. Never bypass the switch.', s: st({ thermo: 1, led: 'fault', block: 1, psw: 'fail' }) }]),
    sensor: N.slice(0, 6).concat([
      { chip: 5, bad: true, text: '<b>No proof of flame.</b> The burners lit, but a dirty or failed flame sensor doesn’t pass the tiny current, so the board can’t tell a flame is there. Within seconds it shuts the gas valve. No proof, no gas.', s: st({ thermo: 1, led: 'fault', inducer: 1, flue: 1, psw: 'ok', sensor: 'fail', hx: 0.15 }) },
      { chip: 5, bad: true, text: '<b>Retry, then lockout.</b> The board clears the heat exchanger and tries again, usually a few times, then locks out and blinks a fault code. From outside it looks like burners that light and go out after a few seconds. A technician cleans or replaces the sensor.', s: st({ thermo: 1, led: 'fault', inducer: 1, flue: 1, psw: 'ok', sensor: 'fail' }) }]),
    filter: N.slice(0, 8).concat([
      { chip: 7, bad: true, text: '<b>The blower starts, but the air can’t get through.</b> A clogged filter chokes the airflow, so too little air crosses the heat exchanger to carry its heat away, and it keeps getting hotter.', s: st(plus(RUN, { gas: 1, flame: 1, sensor: 'ok', hx: 1.5, blower: 0.35 })) },
      { chip: 7, bad: true, text: '<b>The high-limit switch opens.</b> The heat exchanger is too hot, so the limit switch opens and the board shuts the gas valve. The blower keeps running to cool things down.', s: st(plus(RUN, { led: 'fault', hx: 1.2, blower: 0.35, limit: 'open' })) },
      { chip: 7, bad: true, text: '<b>Cycling on the limit.</b> Once it cools, the limit switch closes and the burners light again, only to trip again. Heat that starts and stops, and rooms that never warm up, often mean a clogged filter. Change it; if it keeps happening, call a technician.', s: st(plus(RUN, { led: 'fault', hx: 0.7, blower: 0.35 })) }])
  };
  var PARTS = {
    thermo: ['Thermostat', 'Connects R to W to call for heat (Lesson 9). It switches a 24-volt signal, not the furnace’s power.'],
    board: ['Control board', 'Runs the sequence, checks each safety in turn, and blinks a status light that the furnace’s manual explains.'],
    inducer: ['Draft inducer', 'A small fan that pulls combustion gases through the heat exchanger and pushes them out the vent.'],
    psw: ['Pressure switch', 'Connected to the inducer by a small hose. It closes only when the inducer is really moving air through the vent; until then, no ignition.'],
    vent: ['Vent pipe', 'Carries combustion gases outdoors: metal on most standard furnaces, plastic on condensing ones. Keep its outdoor end clear of snow and debris.'],
    ign: ['Hot-surface igniter', 'A ceramic element that glows hot enough to light the gas. Some furnaces use a spark instead.'],
    gv: ['Gas valve', 'Opens only when the board tells it to, and only after the draft is proved. Gas valve work is for qualified technicians.'],
    burners: ['Burners', 'Mix gas with air and burn it. Steady blue flames are normal; yellow, lazy flames mean it needs service.'],
    sensor: ['Flame sensor', 'A metal rod in the flame. A tiny current that only a flame can carry proves the burners are lit.'],
    hx: ['Heat exchanger', 'Carries the hot combustion gases inside; house air flows across its outside. A crack could leak combustion gases, which is why it’s inspected every year.'],
    limit: ['High-limit switch', 'Opens if the heat exchanger area overheats, usually because airflow is blocked, and shuts the burners off.'],
    blower: ['Blower', 'Pulls room air through the filter, across the heat exchanger, and into the supply ducts.'],
    filter: ['Filter', 'Catches dust before it reaches the blower and heat exchanger. A clogged one starves the furnace of air.'],
    plenum: ['Supply plenum', 'The box on top of the furnace where the supply ducts begin. In a home with central air, the cooling coil often sits here.']
  };

  // ---------- side panel ----------
  side.innerHTML =
    '<div class="hv-head"><h3>Gas furnace start-up</h3><span>a typical sequence</span></div>' +
    '<label class="tr-field">Something wrong?<select class="fu-fault"><option value="none">Nothing: everything works</option><option value="vent">Blocked vent</option><option value="sensor">Dirty flame sensor</option><option value="filter">Clogged filter</option></select></label>' +
    '<div class="hv-chips fu-chips" aria-hidden="true">' + CHIPS.map(function (c, i) { return '<span>' + (i + 1) + ' ' + c + '</span>'; }).join('') + '</div>' +
    '<p class="hv-say fu-say" aria-live="polite"></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn pri fu-play"></button><button type="button" class="hs-btn fu-prev" aria-label="Previous step">◂ Step</button><button type="button" class="hs-btn fu-next" aria-label="Next step">Step ▸</button><button type="button" class="hs-btn ghost fu-reset">↺ Reset</button></div>' +
    '<div class="tr-out"><dl class="hv-kv fu-kv"></dl></div>' +
    '<div class="tr-partname fu-part" aria-live="polite"><b>Tap a part</b> to see what it does.</div>';
  var q = function (s) { return side.querySelector(s); };
  var selF = q('.fu-fault'), elSay = q('.fu-say'), bPlay = q('.fu-play'), elKv = q('.fu-kv'), elPart = q('.fu-part'), chips = side.querySelectorAll('.fu-chips span');

  var cur = { steps: N, i: 0, play: false, t: 0, hx: 0, blower: 0, spin: 0, spin2: 0, flick: 0 };
  function render() {
    var s = cur.steps[cur.i], v = s.s;
    elSay.innerHTML = s.text;
    chips.forEach(function (c, i) { c.classList.toggle('on', i === s.chip && !s.bad); c.classList.toggle('bad', i === s.chip && !!s.bad); c.classList.toggle('done', i < s.chip); });
    function row(a, b, cls) { return '<dt>' + a + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + b + '</dd>'; }
    elKv.innerHTML =
      row('Thermostat (W)', v.thermo ? 'calling for heat' : 'off') +
      row('Draft inducer', v.inducer ? 'running' : 'off') +
      row('Pressure switch', v.psw === 'ok' ? 'closed: draft proved' : v.psw === 'fail' ? 'open: no draft!' : 'open', v.psw === 'fail' ? 'hv-warn' : v.psw === 'ok' ? 'hv-ok' : '') +
      row('Igniter', v.ign ? 'glowing' : 'off') +
      row('Gas valve', v.gas ? 'open' : 'closed') +
      row('Flame sensor', v.sensor === 'ok' ? 'flame proved' : v.sensor === 'fail' ? 'no flame signal!' : '—', v.sensor === 'fail' ? 'hv-warn' : v.sensor === 'ok' ? 'hv-ok' : '') +
      row('High-limit switch', v.limit === 'open' ? 'open: too hot!' : 'closed', v.limit === 'open' ? 'hv-warn' : '') +
      row('Blower', v.blower >= 1 ? 'running' : v.blower > 0 ? 'running, little airflow' : 'off', v.blower > 0 && v.blower < 1 ? 'hv-warn' : '');
    bPlay.textContent = cur.play ? '❚❚ Pause' : (cur.i >= cur.steps.length - 1 ? '▶ Play again' : '▶ Play');
    bPlay.setAttribute('aria-pressed', cur.play ? 'true' : 'false');
    // static visuals
    gTh.classList.toggle('fu-on', !!v.thermo); wire.classList.toggle('fu-live', !!v.thermo);
    led.setAttribute('class', 'fu-led ' + (v.led === 'fault' ? 'fu-ledf' : v.led === 'on' ? 'fu-ledon' : ''));
    pswDot.setAttribute('class', v.psw === 'ok' ? 'fu-ind1' : v.psw === 'fail' ? 'fu-ind2' : 'fu-ind0');
    pswArm.setAttribute('d', v.psw === 'ok' ? 'M306,151 L326,151' : 'M306,151 L318,143');
    senDot.setAttribute('class', v.sensor === 'ok' ? 'fu-ind1' : v.sensor === 'fail' ? 'fu-ind2' : 'fu-ind0');
    ign.setAttribute('class', 'fu-ign' + (v.ign ? ' fu-ignon' : ''));
    lim.setAttribute('class', 'fu-lim' + (v.limit === 'open' ? ' fu-limopen' : ''));
    block.setAttribute('opacity', v.block ? 1 : 0);
    fil.setAttribute('class', 'fu-fil' + (selF.value === 'filter' ? ' fu-dirty' : ''));
    flames.forEach(function (f) { f.setAttribute('opacity', v.flame ? 0.95 : 0); });
    gasDots.forEach(function (o) { o.el.setAttribute('opacity', v.gas ? 1 : 0); });
    setTextState(v);
    // highlight the part acting in this step
    var act = { 0: 'thermo', 1: 'inducer', 2: 'psw', 3: 'ign', 4: 'gv', 5: 'sensor', 6: 'hx', 7: 'blower', 8: 'thermo', 9: 'blower' }[s.chip];
    if (s.bad && selF.value === 'filter') act = (cur.i === cur.steps.length - 2) ? 'limit' : 'filter';
    svg.querySelectorAll('[data-part]').forEach(function (g) { g.classList.toggle('fu-act', g.dataset.part === act); });
  }
  function setTextState(v) {
    tState.textContent = v.led === 'fault' ? 'SAFETY STOP: the control board won’t open the gas valve' : v.gas ? 'BURNERS ON' : v.thermo ? 'STARTING UP' : v.blower ? 'BLOWER RUN-ON' : 'STANDBY';
    tState.setAttribute('class', 'hv-tag fu-state' + (v.led === 'fault' ? ' fu-statef' : ''));
  }
  function go(i) { cur.i = Math.max(0, Math.min(cur.steps.length - 1, i)); cur.t = 0; render(); }
  function hxColor(h) { // 0 cool metal -> 1 hot -> 1.5 overheated
    var a = [150, 160, 155], b = [214, 98, 52], c = [200, 30, 30];
    var x = Math.min(1, h), y = Math.max(0, Math.min(1, (h - 1) * 2));
    var m = a.map(function (v, k) { return v + (b[k] - v) * x; }); m = m.map(function (v, k) { return v + (c[k] - v) * y; });
    return 'rgb(' + m.map(Math.round).join(',') + ')';
  }
  T.loop(root, function (dt) {
    var v = cur.steps[cur.i].s, moving = !T.reduced;
    if (cur.play) {
      cur.t += dt;
      if (cur.t > 2.8) { if (cur.i < cur.steps.length - 1) go(cur.i + 1); else { cur.play = false; render(); } }
    }
    // ease the heat exchanger and blower toward their targets
    cur.hx += (v.hx - cur.hx) * Math.min(1, dt * (T.reduced ? 20 : 1.6));
    cur.blower += (v.blower - cur.blower) * Math.min(1, dt * 3);
    var col = hxColor(cur.hx);
    hxShells.forEach(function (r) { r.style.fill = col; });
    if (moving) {
      if (v.inducer) { cur.spin = (cur.spin + dt * 900) % 360; indBl.setAttribute('transform', 'rotate(' + cur.spin.toFixed(1) + ' 312 100)'); }
      if (cur.blower > 0.05) { cur.spin2 = (cur.spin2 + dt * 600 * cur.blower) % 360; blBl.setAttribute('transform', 'rotate(' + cur.spin2.toFixed(1) + ' 248 340)'); }
      cur.flick += dt;
      flames.forEach(function (f, k) { f.setAttribute('transform', 'translate(0 ' + (204 * (1 - (0.9 + 0.1 * Math.sin(cur.flick * 13 + k * 1.7)))).toFixed(2) + ') scale(1 ' + (0.9 + 0.1 * Math.sin(cur.flick * 13 + k * 1.7)).toFixed(3) + ')'); });
      gasDots.forEach(function (o) { o.t = (o.t + dt * 0.5) % 1; var x = 10 + o.t * 270; o.el.setAttribute('cx', x.toFixed(1)); o.el.setAttribute('cy', 224); });
    } else {
      gasDots.forEach(function (o) { o.el.setAttribute('cx', (10 + o.t * 270).toFixed(1)); o.el.setAttribute('cy', 224); });
    }
    // flue gas particles: up through the shells, then up the vent
    flue.forEach(function (p) {
      if (moving && v.flue) p.t = (p.t + dt * 0.45) % 1;
      var xs = [159, 193, 227, 261, 312][p.lane], x, y;
      if (p.lane < 4) { x = xs; y = 196 - p.t * 120; } else { x = 312; y = 84 - p.t * 76; }
      p.el.setAttribute('cx', x); p.el.setAttribute('cy', y.toFixed(1));
      p.el.setAttribute('opacity', v.flue ? (v.flame || p.lane === 4 ? 0.75 : 0.35) : 0);
    });
    // house air arrows
    var b = cur.blower, warm = cur.hx > 0.5;
    airArrows.concat(outArrows).forEach(function (a) { a.setAttribute('opacity', (b * 0.9).toFixed(2)); a.setAttribute('stroke-width', (1.5 + 3 * b).toFixed(1)); a.setAttribute('class', 'fu-air ' + (warm ? 'fu-warm' : 'fu-cool')); a.setAttribute('marker-end', 'url(#fu-' + (warm ? 'a' : 'c') + ')'); });
    retArrows.forEach(function (a) { a.setAttribute('opacity', (b * 0.9).toFixed(2)); a.setAttribute('stroke-width', (1.5 + 3 * b).toFixed(1)); });
  });
  function setFault() { cur.steps = FAULTS[selF.value]; go(0); }
  selF.addEventListener('change', function () { cur.play = false; setFault(); });
  bPlay.addEventListener('click', function () {
    if (cur.play) { cur.play = false; render(); return; }
    if (cur.i >= cur.steps.length - 1) go(0);
    cur.play = true; cur.t = 0; render();
  });
  q('.fu-next').addEventListener('click', function () { cur.play = false; go(cur.i + 1); });
  q('.fu-prev').addEventListener('click', function () { cur.play = false; go(cur.i - 1); });
  q('.fu-reset').addEventListener('click', function () { cur.play = false; go(0); });
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function show() { var p = PARTS[g.dataset.part]; if (!p) return; svg.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('sel', x === g); }); elPart.innerHTML = '<b>' + p[0] + ':</b> ' + p[1]; }
    g.addEventListener('click', show);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(); } });
  });
  go(0);
})(window, document);
