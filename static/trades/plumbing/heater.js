/* Plumbing course, Lesson 5: a water heater cutaway and a tankless power calculator.
   Tank: 16 layers, hot water leaves from the top and cold enters at the bottom through the dip tube (DOE Energy Saver);
   warmer water floats on cooler water (OpenStax 13.2: water is densest at 4 °C). Heating rates are illustrative and time runs
   about 60 times faster than real life. Thermostat settings and notes: DOE (120 °F for most households; 140 °F wastes
   $36–61/yr), CPSC (burn times at 120/130/140 °F), CDC (Legionella grows best at 77–113 °F; keep heaters at or above 120 °F;
   130–140 °F kills many germs but raises scald risk). T&P behavior: UMD Extension; capped discharge: HUD NSPIRE.
   Tankless: P = m-dot × c × ΔT with c = 4,186 J/(kg·°C) (OpenStax 14.2), 1 gal = 3.785412 L, 1 Btu = 1,055.056 J (NIST),
   about 1 kg per liter of water; DOE: 2 to 5 gallons per minute typical. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-heater');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var N = 16, TIN = 50, AMB = 65, GAL = 40;
  var st = { mode: 'gas', set: 120, Tl: [], tap: false, drawn: 0, fault: false, capped: false, relief: 0, heat: [0, 0], stopped: false };
  for (var i = 0; i < N; i++) st.Tl.push(120);
  var TOP = 74, BOT = 356, LH = (BOT - TOP) / N;

  root.innerHTML = '';
  var tabs = T.h('div', { class: 'tr-seg', role: 'group', 'aria-label': 'Choose a view' }, '<button type="button" data-t="tank" aria-pressed="true">Tank heater</button><button type="button" data-t="tankless" aria-pressed="false">Tankless math</button>');
  root.appendChild(tabs);
  var paneA = T.h('div', { class: 'tr-w-grid wh-a' }); root.appendChild(paneA);
  var paneB = T.h('div', { class: 'tr-w-grid wh-b' }); paneB.hidden = true; root.appendChild(paneB);
  tabs.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      paneA.hidden = b.dataset.t !== 'tank'; paneB.hidden = b.dataset.t === 'tank';
    });
  });

  // ---------------- tank view ----------------
  var stage = T.h('div', { class: 'tr-w-stage' }); paneA.appendChild(stage);
  var side = T.h('div'); paneA.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 380 430', role: 'img', 'aria-label': 'Cutaway of a tank water heater showing the water temperature from top to bottom, the dip tube, anode rod, heat source, thermostat and T&P relief valve', class: 'pl-wh' }, stage);
  function part(key, name, parent) { return S('g', { 'data-part': key, tabindex: '0', role: 'button', 'aria-label': name }, parent || svg); }
  S('path', { class: 'pl-wh-floor', d: 'M0,416 H380' }, svg);
  var gTank = part('tank', 'Tank and insulation');
  S('rect', { class: 'pl-wh-jacket', x: 106, y: 58, width: 168, height: 318, rx: 22 }, gTank);
  S('rect', { class: 'pl-wh-inner', x: 120, y: 72, width: 140, height: 288, rx: 14 }, gTank);
  var layers = S('g', null, svg), lay = [];
  for (i = 0; i < N; i++) lay.push(S('rect', { x: 122, width: 136, y: (BOT - (i + 1) * LH).toFixed(1), height: (LH + 0.6).toFixed(1) }, layers));
  var sed = S('rect', { class: 'pl-wh-sed', x: 124, y: 350, width: 132, height: 7, rx: 3 }, svg);
  // pipes
  var gHot = part('hot', 'Hot water outlet');
  S('path', { class: 'pl-wh-hotp', d: 'M150,72 V18 H96' }, gHot);
  var hotFlow = S('path', { class: 'pl-wh-flowh', d: 'M150,70 V18 H96' }, gHot);
  S('text', { class: 'pl-wh-t pl-wh-b', x: 92, y: 14, 'text-anchor': 'end' }, gHot).textContent = 'hot out';
  var gDip = part('dip', 'Cold inlet and dip tube');
  S('path', { class: 'pl-wh-coldp', d: 'M290,18 H236 V72' }, gDip);
  S('path', { class: 'pl-wh-dip', d: 'M236,72 V330' }, gDip);
  var dipFlow = S('path', { class: 'pl-wh-flowc', d: 'M290,18 H236 V330' }, gDip);
  S('text', { class: 'pl-wh-t pl-wh-b', x: 294, y: 14 }, gDip).textContent = 'cold in';
  S('path', { class: 'pl-wh-lead', d: 'M240,250 H284' }, gDip);
  S('text', { class: 'pl-wh-t', x: 287, y: 254 }, gDip).textContent = 'dip tube';
  var gAn = part('anode', 'Anode rod');
  S('path', { class: 'pl-wh-anode', d: 'M168,66 V300' }, gAn);
  S('text', { class: 'pl-wh-t', x: 162, y: 296, 'text-anchor': 'end' }, gAn).textContent = 'anode';
  // gas parts
  var gGas = S('g', null, svg);
  var gFlue = part('flue', 'Flue, draft hood and vent', gGas);
  S('path', { class: 'pl-wh-flue', d: 'M200,362 V58' }, gFlue);
  S('path', { class: 'pl-wh-hood', d: 'M184,52 h32 l-8,-12 h-16 z M200,40 V2' }, gFlue);
  var gBurn = part('burner', 'Gas burner', gGas);
  S('rect', { class: 'pl-wh-chamber', x: 122, y: 362, width: 136, height: 30, rx: 4 }, gBurn);
  var flames = S('path', { class: 'pl-wh-flame', d: 'M150,388 q6,-16 12,0 q6,-16 12,0 q6,-16 12,0 q6,-16 12,0 q6,-16 12,0 q6,-16 12,0' }, gBurn);
  var gTs = part('thermo', 'Thermostat and gas valve', gGas);
  S('rect', { class: 'pl-wh-ctl', x: 88, y: 314, width: 34, height: 30, rx: 5 }, gTs);
  S('path', { class: 'pl-wh-gas', d: 'M60,330 H88' }, gTs);
  S('text', { class: 'pl-wh-t', x: 56, y: 312, 'text-anchor': 'middle' }, gTs).textContent = 'thermostat';
  // electric parts
  var gEl = S('g', null, svg);
  var gE1 = part('elements', 'Heating elements and thermostats', gEl);
  var el1 = S('path', { class: 'pl-wh-el', d: 'M258,140 H196 q-8,0 -8,6 q0,6 8,6 H258' }, gE1);
  var el2 = S('path', { class: 'pl-wh-el', d: 'M258,306 H196 q-8,0 -8,6 q0,6 8,6 H258' }, gE1);
  S('rect', { class: 'pl-wh-ctl', x: 274, y: 132, width: 22, height: 26, rx: 4 }, gE1); S('rect', { class: 'pl-wh-ctl', x: 274, y: 298, width: 22, height: 26, rx: 4 }, gE1);
  S('text', { class: 'pl-wh-t', x: 300, y: 130 }, gE1).textContent = 'upper';
  S('text', { class: 'pl-wh-t', x: 300, y: 296 }, gE1).textContent = 'lower';
  // heat pump parts
  var gHp = S('g', null, svg);
  var gHp1 = part('hp', 'Heat pump: fan, compressor and coil', gHp);
  S('rect', { class: 'pl-wh-hpbox', x: 106, y: 20, width: 168, height: 40, rx: 12 }, gHp1);
  var fan = S('g', null, gHp1);
  S('circle', { class: 'pl-wh-fanc', cx: 190, cy: 40, r: 14 }, fan);
  S('path', { class: 'pl-wh-fan', d: 'M190,40 l0,-12 M190,40 l10,6 M190,40 l-10,6' }, fan);
  S('path', { class: 'pl-wh-coil', d: 'M120,210 H260 M120,240 H260 M120,270 H260 M120,300 H260 M120,330 H260' }, gHp1);
  S('text', { class: 'pl-wh-t', x: 236, y: 44 }, gHp1).textContent = 'fan';
  // T&P valve and discharge pipe
  var gTp = part('tp', 'Temperature-and-pressure relief valve and discharge pipe');
  S('path', { class: 'pl-wh-dis', d: 'M292,98 H344 V404' }, gTp);
  S('rect', { class: 'pl-wh-tp', x: 274, y: 88, width: 22, height: 20, rx: 4 }, gTp);
  S('path', { class: 'pl-wh-lever', d: 'M285,88 V78 h10' }, gTp);
  var cap = S('rect', { class: 'pl-wh-cap', x: 337, y: 400, width: 14, height: 8, rx: 2 }, gTp);
  var spray = S('path', { class: 'pl-wh-spray', d: 'M344,404 q-10,6 -18,4 M344,404 q0,8 -4,12 M344,404 q10,6 18,4' }, gTp);
  S('text', { class: 'pl-wh-t pl-wh-b', x: 300, y: 82 }, gTp).textContent = 'T&P';
  S('text', { class: 'pl-wh-t', x: 336, y: 392, 'text-anchor': 'end' }, gTp).textContent = 'discharge';
  S('text', { class: 'pl-wh-t', x: 336, y: 406, 'text-anchor': 'end' }, gTp).textContent = 'pipe';
  var gDr = part('drain', 'Drain valve');
  S('path', { class: 'pl-wh-drain', d: 'M106,348 H92 v8' }, gDr);
  var tOut = S('text', { class: 'pl-wh-t pl-wh-big', x: 6, y: 46 }, svg);
  var warnBox = S('g', { class: 'pl-wh-warn' }, svg);
  S('rect', { x: 20, y: 150, width: 340, height: 110, rx: 12 }, warnBox);
  var warnT1 = S('text', { x: 190, y: 190, 'text-anchor': 'middle', class: 'pl-wh-wt' }, warnBox);
  var warnT2 = S('text', { x: 190, y: 214, 'text-anchor': 'middle', class: 'pl-wh-wt2' }, warnBox);
  var warnT3 = S('text', { x: 190, y: 236, 'text-anchor': 'middle', class: 'pl-wh-wt2' }, warnBox);

  side.innerHTML =
    '<div class="tr-seg wh-mode" role="group" aria-label="Heat source"><button type="button" data-m="gas" aria-pressed="true">Gas</button><button type="button" data-m="el" aria-pressed="false">Electric</button><button type="button" data-m="hp" aria-pressed="false">Heat pump</button></div>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn wh-tap" aria-pressed="false">▶ Run a shower</button><span class="hs-small wh-drawn"></span></div>' +
    '<p class="hs-small" style="margin:.4rem 0 .2rem"><b>Thermostat setting</b></p>' +
    '<div class="tr-seg wh-set" role="group" aria-label="Thermostat setting"><button type="button" data-s="120" aria-pressed="true">120°F</button><button type="button" data-s="130" aria-pressed="false">130°F</button><button type="button" data-s="140" aria-pressed="false">140°F</button></div>' +
    '<div class="tr-out wh-info" aria-live="polite"></div>' +
    '<div class="tr-partname wh-name" aria-live="polite">Tap a part to name it.</div>' +
    '<details class="wh-fault"><summary>What if the thermostat fails?</summary><p class="hs-small">Watch the temperature-and-pressure relief valve do its job. Then see why its pipe must never be capped.</p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost wh-stuck" aria-pressed="false">Thermostat stuck on</button><button type="button" class="hs-btn ghost wh-cap" aria-pressed="false">Cap the discharge pipe</button><button type="button" class="hs-btn ghost wh-reset">Reset</button></div></details>';
  var q = function (s) { return side.querySelector(s); };
  var info = q('.wh-info'), nameBox = q('.wh-name');
  var NAMES = { tank: '<b>Tank:</b> DOE says 20 to 80 gallons for a home. Insulation slows the standby heat loss.', hot: '<b>Hot water outlet:</b> hot water leaves from the top, where the hottest water floats.',
    dip: '<b>Cold inlet and dip tube:</b> the dip tube carries incoming cold water to the bottom so it doesn’t mix with the hot water at the top.',
    anode: '<b>Anode rod:</b> a metal rod that corrodes so the steel tank doesn’t. DOE suggests inspecting it every three to four years.',
    flue: '<b>Flue, draft hood and vent:</b> carry hot exhaust, including carbon monoxide, up through the tank and outdoors. Soot on top of the tank means a clogged flue (HUD).',
    burner: '<b>Gas burner:</b> heats the bottom of the tank; the exhaust heats the water again on its way up the flue.',
    thermo: '<b>Thermostat and gas valve:</b> turn the burner on and off to hold the setting. Follow the manufacturer’s instructions to adjust it (CPSC).',
    elements: '<b>Heating elements:</b> most electric heaters have an upper and a lower element, each with its own thermostat behind a panel with live wiring (CPSC).',
    hp: '<b>Heat pump:</b> a fan draws room air over a cold coil; a compressor pumps that heat into the water. DOE: 2 to 3 times as efficient as electric resistance heating.',
    tp: '<b>T&P relief valve:</b> opens to release hot water or steam if the temperature or pressure gets too high. Its discharge pipe runs toward the floor or a drain. Never cap it.',
    drain: '<b>Drain valve:</b> for draining or flushing the tank, following the manual. The water is scalding.' };
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function show() { svg.querySelectorAll('[data-part]').forEach(function (x) { x.classList.toggle('sel', x === g); }); nameBox.innerHTML = NAMES[g.dataset.part]; }
    g.addEventListener('click', show);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { show(); e.preventDefault(); } });
  });
  var SETINFO = {
    120: '<p><b>120°F.</b> DOE says most households need only 120°F, a setting it calls safe for most of the population. CPSC urges 120°F. Even so, CPSC says a five-minute exposure at 120°F can cause third-degree burns. CDC: keep heaters at or above 120°F to minimize <i>Legionella</i> growth.</p>',
    130: '<p><b>130°F.</b> CPSC: burns can occur with a thirty-second exposure to 130°F water. CDC: water at 130 to 140°F kills many harmful germs but increases the scalding risk; above 120°F, use thermostatic mixing valves at faucets and showers.</p>',
    140: '<p><b>140°F.</b> CPSC: burns in six seconds. DOE: a heater set at 140°F can waste $36 to $61 a year in standby losses and significantly increases the scalding risk; people with a suppressed immune system or chronic respiratory disease may consider 140°F with mixing valves on the taps.</p>' };
  function color(t) {
    // 50 °F blue → 90 violet-ish → 140 °F red; beyond 150: deep red
    var u = Math.max(0, Math.min(1, (t - 50) / 95));
    var c1 = [74, 144, 217], c2 = [214, 64, 40];
    return 'rgb(' + c1.map(function (v, k) { return Math.round(v + (c2[k] - v) * u); }).join(',') + ')';
  }
  function fmtT(t) { return t > 150 ? 'dangerously hot' : Math.round(t) + '°F'; }
  function render() {
    for (var i = 0; i < N; i++) lay[i].setAttribute('fill', color(st.Tl[i]));
    gGas.style.display = st.mode === 'gas' ? '' : 'none';
    gEl.style.display = st.mode === 'el' ? '' : 'none';
    gHp.style.display = st.mode === 'hp' ? '' : 'none';
    flames.style.opacity = st.mode === 'gas' && st.heat[0] > 0 ? 1 : 0;
    el1.setAttribute('class', 'pl-wh-el' + (st.mode === 'el' && st.heat[1] > 0 ? ' on' : ''));
    el2.setAttribute('class', 'pl-wh-el' + (st.mode === 'el' && st.heat[0] > 0 ? ' on' : ''));
    fan.setAttribute('transform', st.mode === 'hp' && st.heat[0] > 0 && !T.reduced ? 'rotate(' + ((st.ang || 0) % 360).toFixed(0) + ' 190 40)' : '');
    hotFlow.style.display = st.tap ? '' : 'none'; dipFlow.style.display = st.tap ? '' : 'none';
    [hotFlow, dipFlow].forEach(function (p) { p.style.strokeDashoffset = T.reduced ? 0 : -((st.ang || 0) * 0.4) % 20; });
    cap.style.display = st.capped ? '' : 'none';
    spray.style.display = st.relief > 0 && !st.capped ? '' : 'none';
    tOut.textContent = fmtT(st.Tl[N - 1]) + ' at the top';
    q('.wh-drawn').textContent = T.fmt(st.drawn, 1) + ' gal used';
    warnBox.style.display = st.stopped ? '' : 'none';
  }
  function heaterStep(dt) {
    var sim = dt * 60;                                  // seconds of simulated time
    var T_ = st.Tl;
    // draw water: plug flow upward, 2 gpm
    if (st.tap) {
      var gal = 2 * sim / 60; st.drawn += gal;
      var f = Math.min(0.9, gal / (GAL / N));
      for (var i = N - 1; i > 0; i--) T_[i] += (T_[i - 1] - T_[i]) * f;
      T_[0] += (TIN - T_[0]) * f;
    }
    // heating
    var rate = { gas: 0.09, el: 0.05, hp: 0.035 }[st.mode];   // °F per simulated second per heated layer group (illustrative)
    st.heat = [0, 0];
    var hy = function (key, t) { if (t < st.set - 4) st[key] = true; else if (t >= st.set) st[key] = false; return st[key]; };
    if (st.mode === 'gas' || st.mode === 'hp') { if (hy('h0', T_[2])) st.heat[0] = 1; }
    else { if (hy('h1', T_[12])) st.heat[1] = 1; else if (hy('h0', T_[2])) st.heat[0] = 1; }
    if (st.fault) st.heat = st.mode === 'el' ? [1, 1] : [1, 0];
    if (st.stopped) st.heat = [0, 0];
    if (st.fault) rate *= 4;                           // speed up the failure demonstration
    if (st.heat[0]) { T_[0] += rate * sim * 3; T_[1] += rate * sim * 1.5; }
    if (st.heat[1]) { T_[11] += rate * sim * 2; T_[12] += rate * sim * 2; }
    // buoyancy: warmer water rises
    for (var k = 0; k < 3; k++) for (i = 0; i < N - 1; i++) if (T_[i] > T_[i + 1] + 0.2) { var m = (T_[i] + T_[i + 1]) / 2; T_[i] = m; T_[i + 1] = m; }
    // standby loss
    for (i = 0; i < N; i++) T_[i] += (AMB - T_[i]) * 0.00003 * sim;
    // relief valve
    st.relief = Math.max(0, st.relief - dt);
    if (T_[N - 1] > 175) {
      if (st.capped) { if (!st.stopped) { st.stopped = true; setInfo(); } }
      else { st.relief = 1.2; for (i = N - 1; i >= N - 5; i--) T_[i] -= 9; T_[0] = TIN; }
    }
    st.ang = (st.ang || 0) + dt * 240;
  }
  function setInfo() {
    var o = SETINFO[st.set];
    if (st.fault && !st.stopped) o = '<p class="warn">Thermostat stuck on.</p><p>The heat stays on, so the water gets hotter and its pressure rises. The T&amp;P valve is the last line of defense: it opens and dumps scalding water and steam down the discharge pipe, toward the floor or a drain, where it can’t hurt anyone. A heater that does this needs a plumber now.</p>';
    if (st.stopped) o = '<p class="warn">The discharge pipe is capped, so the relief valve can’t do its job.</p><p>HUD’s inspection standard treats a capped, blocked or upward-sloping discharge pipe as a severe deficiency because of the risk of a rupturing water heater. Never cap or plug it. If water drips from it, call a plumber.</p>';
    info.innerHTML = o;
  }
  warnT1.textContent = 'Simulation stopped';
  warnT2.textContent = 'A capped discharge pipe can let a tank'; warnT3.textContent = 'rupture. Never cap or plug it.';
  side.querySelectorAll('.wh-mode button').forEach(function (b) { b.addEventListener('click', function () { st.mode = b.dataset.m; side.querySelectorAll('.wh-mode button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); render(); }); });
  side.querySelectorAll('.wh-set button').forEach(function (b) { b.addEventListener('click', function () { st.set = +b.dataset.s; side.querySelectorAll('.wh-set button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); setInfo(); }); });
  var tapB = q('.wh-tap');
  tapB.addEventListener('click', function () { st.tap = !st.tap; tapB.setAttribute('aria-pressed', st.tap ? 'true' : 'false'); tapB.textContent = st.tap ? '■ Stop the shower' : '▶ Run a shower'; });
  var stuckB = q('.wh-stuck'), capB = q('.wh-cap');
  stuckB.addEventListener('click', function () { st.fault = !st.fault; stuckB.setAttribute('aria-pressed', st.fault ? 'true' : 'false'); setInfo(); });
  capB.addEventListener('click', function () { st.capped = !st.capped; capB.setAttribute('aria-pressed', st.capped ? 'true' : 'false'); if (!st.capped) st.stopped = false; setInfo(); render(); });
  q('.wh-reset').addEventListener('click', function () {
    st.fault = false; st.capped = false; st.stopped = false; st.relief = 0; for (var i = 0; i < N; i++) st.Tl[i] = st.set;
    stuckB.setAttribute('aria-pressed', 'false'); capB.setAttribute('aria-pressed', 'false'); setInfo(); render();
  });
  setInfo(); render();
  T.loop(root, function (dt) { if (paneA.hidden) return; heaterStep(dt); render(); });

  // ---------------- tankless math ----------------
  var st2 = { g: 2.0, tin: 50, tout: 110 };
  var stage2 = T.h('div', { class: 'tr-w-stage' }); paneB.appendChild(stage2);
  var side2 = T.h('div'); paneB.appendChild(side2);
  var sv2 = S('svg', { viewBox: '0 0 380 250', role: 'img', 'aria-label': 'Tankless water heater: cold water in, heat exchanger, hot water out, with a bar showing the power needed', class: 'pl-wh' }, stage2);
  S('path', { class: 'pl-wh-coldp', d: 'M20,200 H120 V170' }, sv2);
  S('path', { class: 'pl-wh-hotp', d: 'M220,170 V200 H360' }, sv2);
  S('rect', { class: 'pl-wh-jacket', x: 110, y: 40, width: 120, height: 134, rx: 10 }, sv2);
  S('path', { class: 'pl-wh-hx', d: 'M128,150 V70 H146 V150 H164 V70 H182 V150 H200 V70 H214 V160' }, sv2);
  var fl2 = S('path', { class: 'pl-wh-flame', d: 'M128,166 q6,-12 12,0 q6,-12 12,0 q6,-12 12,0 q6,-12 12,0 q6,-12 12,0 q6,-12 12,0 q6,-12 12,0' }, sv2);
  var tIn2 = S('text', { class: 'pl-wh-t pl-wh-b', x: 24, y: 192 }, sv2), tOut2 = S('text', { class: 'pl-wh-t pl-wh-b', x: 356, y: 192, 'text-anchor': 'end' }, sv2);
  S('text', { class: 'pl-wh-t', x: 170, y: 32, 'text-anchor': 'middle' }, sv2).textContent = 'heat exchanger';
  S('text', { class: 'pl-wh-t', x: 24, y: 220 }, sv2).textContent = 'flow sensor turns it on';
  S('rect', { class: 'pl-wh-barbg', x: 260, y: 40, width: 26, height: 130, rx: 5 }, sv2);
  var bar = S('rect', { class: 'pl-wh-bar', x: 260, width: 26, rx: 5 }, sv2);
  var barT = S('text', { class: 'pl-wh-t pl-wh-b', x: 292, y: 60 }, sv2);
  S('text', { class: 'pl-wh-t', x: 292, y: 172 }, sv2).textContent = '0 kW';
  S('text', { class: 'pl-wh-t', x: 292, y: 46 }, sv2).textContent = '60 kW';
  side2.innerHTML =
    '<label class="tr-field">Hot water flow: <span class="v tk-v1"></span><input type="range" class="tk-g" min="0.5" max="5" step="0.1" value="2" aria-label="Flow in gallons per minute"></label>' +
    '<label class="tr-field">Incoming water temperature: <span class="v tk-v2"></span><input type="range" class="tk-in" min="35" max="75" step="1" value="50" aria-label="Incoming water temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Temperature you want out: <span class="v tk-v3"></span><input type="range" class="tk-out" min="100" max="120" step="1" value="110" aria-label="Outgoing water temperature, degrees Fahrenheit"></label>' +
    '<div class="tr-out tk-res" aria-live="polite"></div>';
  var q2 = function (s) { return side2.querySelector(s); };
  function calc() {
    st2.g = +q2('.tk-g').value; st2.tin = +q2('.tk-in').value; st2.tout = +q2('.tk-out').value;
    var dF = st2.tout - st2.tin, dC = dF / 1.8, kgs = st2.g * 3.785412 / 60, P = kgs * 4186 * dC, btuh = P * 3600 / 1055.056;
    q2('.tk-v1').textContent = st2.g.toFixed(1) + ' gallons per minute';
    q2('.tk-v2').textContent = st2.tin + '°F'; q2('.tk-v3').textContent = st2.tout + '°F';
    tIn2.textContent = st2.tin + '°F in'; tOut2.textContent = st2.tout + '°F out';
    var h = Math.min(130, 130 * P / 60000);
    bar.setAttribute('y', (170 - h).toFixed(1)); bar.setAttribute('height', h.toFixed(1));
    barT.setAttribute('y', Math.max(60, 170 - h + 4).toFixed(0)); barT.textContent = (P / 1000).toFixed(1) + ' kW';
    fl2.style.opacity = Math.min(1, 0.3 + P / 40000);
    q2('.tk-res').innerHTML =
      '<p>Temperature rise: <b>' + dF + '°F</b> (' + dC.toFixed(1) + '°C)</p>' +
      '<p>Water flowing: <b>' + kgs.toFixed(3) + ' kg each second</b> (about 1 kg per liter)</p>' +
      '<p>Power needed: <span class="big">' + (P / 1000).toFixed(1) + ' kW</span> ≈ ' + T.fmt(btuh, 0) + ' Btu per hour</p>' +
      '<p>A 10-minute shower at this rate: <b>' + (P / 1000 / 6).toFixed(2) + ' kWh</b> of heat.</p>' +
      '<p class="hs-small">P = flow × 4,186 J/(kg·°C) × rise. DOE says tankless heaters typically deliver 2 to 5 gallons per minute; a WaterSense showerhead uses at most 2.0. Colder incoming water in winter means a bigger rise and more power.</p>';
  }
  side2.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', calc); });
  calc();
})(window, document);
