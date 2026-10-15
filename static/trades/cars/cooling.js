/* Cars course, Lesson 4: the cooling loop. A simple heat-balance model on a 0-to-1 temperature scale (no degrees,
   since normal temperatures vary by engine): heat in from the engine, heat out through the radiator in proportion to
   the thermostat opening and the airflow (road speed or fan), plus small losses. Scenarios show how a stuck thermostat
   or a dead fan shows up on the gauge. Flow dots are decorative and stop under prefers-reduced-motion. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-cooling');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;

  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 460 300', role: 'img', 'aria-label': 'Engine cooling system with radiator, fan, thermostat, water pump, heater core and temperature gauge', class: 'tr-cool' }, stage);

  function part(key, name) { return S('g', { 'data-part': key, tabindex: '0', role: 'button', 'aria-label': name }, svg); }
  function txt(x, y, s, cls, anchor) { var t = S('text', { x: x, y: y, class: cls || 'c-lab', 'text-anchor': anchor || 'middle' }, svg); t.textContent = s; return t; }

  // pipes (drawn first)
  var P = {
    upper: 'M138,72 H96 Q70,72 62,74',
    lower: 'M62,236 Q96,262 182,258',
    bypass: 'M150,86 V200 Q150,248 182,254',
    heatOut: 'M300,96 V66 H370',
    heatBack: 'M428,100 H442 V284 H214 V272'
  };
  for (var k in P) S('path', { class: 'c-pipe', d: P[k] }, svg);
  // radiator
  var gRad = part('rad', 'Radiator');
  S('rect', { class: 'c-rad', x: 22, y: 56, width: 40, height: 190, rx: 4 }, gRad);
  for (var y = 66; y < 240; y += 8) S('path', { class: 'c-fin', d: 'M25,' + y + ' H59' }, gRad);
  // reservoir
  var gRes = part('res', 'Coolant reservoir');
  S('path', { class: 'c-pipe2', d: 'M42,56 V44 H76' }, gRes);
  S('rect', { class: 'c-res', x: 76, y: 18, width: 44, height: 30, rx: 5 }, gRes);
  var resLevel = S('rect', { class: 'c-cool', x: 78, y: 32, width: 40, height: 14, rx: 3 }, gRes);
  // fan
  var gFan = part('fan', 'Cooling fan');
  S('circle', { class: 'c-fanring', cx: 96, cy: 151, r: 32 }, gFan);
  var fan = S('g', null, gFan);
  for (var b = 0; b < 4; b++) S('ellipse', { class: 'c-blade', cx: 96, cy: 133, rx: 7, ry: 16, transform: 'rotate(' + (b * 90) + ' 96 151)' }, fan);
  S('circle', { class: 'c-hub', cx: 96, cy: 151, r: 5 }, gFan);
  // engine
  var gEng = part('engine', 'Engine and water jacket');
  S('rect', { class: 'c-eng', x: 176, y: 96, width: 156, height: 140, rx: 12 }, gEng);
  var glow = S('rect', { class: 'c-glow', x: 176, y: 96, width: 156, height: 140, rx: 12, opacity: 0 }, gEng);
  S('path', { class: 'c-jacket', d: 'M190,112 H318 V220 H190 Z' }, gEng);
  [214, 242, 270, 298].forEach(function (x) { S('circle', { class: 'c-cyl', cx: x, cy: 166, r: 12 }, gEng); });
  // thermostat
  var gTh = part('thermo', 'Thermostat');
  S('circle', { class: 'c-th', cx: 150, cy: 72, r: 14 }, gTh);
  var thValve = S('path', { class: 'c-thv', d: 'M139,72 H161' }, gTh);
  // water pump
  var gPump = part('pump', 'Water pump');
  S('circle', { class: 'c-pump', cx: 196, cy: 258, r: 14 }, gPump);
  var imp = S('path', { class: 'c-imp', d: 'M196,248 V268 M186,258 H206' }, gPump);
  // heater core
  var gHeat = part('heater', 'Heater core');
  S('rect', { class: 'c-heat', x: 370, y: 52, width: 58, height: 48, rx: 5 }, gHeat);
  for (var hx = 378; hx < 424; hx += 7) S('path', { class: 'c-fin', d: 'M' + hx + ',56 V96' }, gHeat);
  // gauge
  var gG = part('gauge', 'Temperature gauge');
  S('path', { class: 'c-gbg', d: 'M352,236 A38,38 0 0 1 428,236' }, gG);
  var arcPt = function (t) { var a = (-80 + 160 * t - 90) * Math.PI / 180; return [390 + 38 * Math.cos(a), 236 + 38 * Math.sin(a)]; };
  function arc(t1, t2, cls) { var a = arcPt(t1), b = arcPt(t2); S('path', { class: cls, d: 'M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' A38,38 0 0 1 ' + b[0].toFixed(1) + ',' + b[1].toFixed(1) }, gG); }
  arc(0.45, 0.66, 'c-gok'); arc(0.85, 1, 'c-ghot');
  var needle = S('path', { class: 'c-needle', d: 'M390,236 V204' }, gG);
  S('circle', { class: 'c-hub', cx: 390, cy: 236, r: 4 }, gG);
  txt(352, 252, 'C', 'c-lab c-b'); txt(428, 252, 'H', 'c-lab c-b');
  // steam (overheating)
  var steam = S('path', { class: 'c-steam', d: 'M88,14 q-6,-8 0,-14 M98,14 q-6,-8 0,-14 M108,14 q-6,-8 0,-14', opacity: 0 }, svg);
  // labels
  txt(42, 262, 'radiator'); txt(98, 64, 'reservoir', 'c-lab', 'middle').setAttribute('y', 12);
  txt(96, 199, 'fan'); txt(254, 92, 'engine'); txt(170, 62, 'thermostat', 'c-lab', 'start'); txt(196, 290, 'water pump');
  txt(399, 116, 'heater core'); txt(390, 188, 'temperature', 'c-lab');
  txt(112, 248, 'lower hose', 'c-lab c-sm'); txt(100, 86, 'upper hose', 'c-lab c-sm'); txt(160, 160, 'bypass', 'c-lab c-sm', 'start');

  // flow dots
  var paths = {
    rad: S('path', { d: 'M150,80 L150,72 L138,72 H96 Q70,72 62,74 L42,80 L42,232 L62,236 Q96,262 182,258 L196,250 L196,120 Q196,96 170,86 L150,80', fill: 'none' }, svg),
    by: S('path', { d: 'M196,250 L196,120 Q196,96 170,86 L150,86 V200 Q150,248 182,254 L196,250', fill: 'none' }, svg),
    heat: S('path', { d: 'M196,250 V122 Q196,104 216,104 H300 V66 H370 L428,84 H442 V284 H214 V272 L196,250', fill: 'none' }, svg)
  };
  var dots = { rad: [], by: [], heat: [] }, lens = {};
  Object.keys(paths).forEach(function (n) {
    lens[n] = paths[n].getTotalLength ? paths[n].getTotalLength() : 400;
    var cnt = n === 'rad' ? 16 : 9;
    for (var i = 0; i < cnt; i++) dots[n].push({ el: S('circle', { r: 3.2, class: 'c-dot', opacity: 0 }, svg), t: i / cnt });
  });

  // ----- side panel -----
  side.innerHTML =
    '<h3 class="c-title">Cooling system</h3>' +
    '<p class="c-status" aria-live="polite" style="margin:.2rem 0 .5rem;line-height:1.5;min-height:4.5em"></p>' +
    '<div class="tr-out"><p>Thermostat: <b class="c-o-th"></b></p><p>Fan: <b class="c-o-fan"></b></p><p>Gauge: <b class="c-o-g"></b></p></div>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn pri c-start">▶ Start the engine</button><button type="button" class="hs-btn c-pause" aria-pressed="false">❚❚ Pause</button></div>' +
    '<div class="tr-field"><span>Driving</span><div class="tr-seg c-drive" role="group" aria-label="Driving"><button type="button" data-v="hwy" aria-pressed="true">Highway</button><button type="button" data-v="traffic">Stop-and-go traffic</button></div></div>' +
    '<label class="tr-field">Something wrong?<select class="c-fault"><option value="none">Nothing: everything works</option><option value="closed">Thermostat stuck closed</option><option value="open">Thermostat stuck open</option><option value="fan">Cooling fan not working</option></select></label>' +
    '<label class="tr-field" style="flex-direction:row;align-items:center;gap:.5rem"><input type="checkbox" class="c-heater" checked> Heater on</label>' +
    '<div class="tr-field"><span>Speed</span><div class="tr-seg c-speed" role="group" aria-label="Simulation speed"><button type="button" data-v="1" aria-pressed="true">1×</button><button type="button" data-v="3">3×</button></div></div>' +
    '<div class="tr-partname" aria-live="polite"><b>Tap a part</b> to see what it does.</div>';
  var q = function (s) { return side.querySelector(s); };
  var elStatus = q('.c-status'), oTh = q('.c-o-th'), oFan = q('.c-o-fan'), oG = q('.c-o-g'), elPart = q('.tr-partname');

  // ----- model -----
  var st = { T: 0, run: false, paused: false, fanOn: false, drive: 'hwy', fault: 'none', heater: true, mult: 1, time: 0 };
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function opening() { return st.fault === 'closed' ? 0 : st.fault === 'open' ? 1 : clamp((st.T - 0.5) / 0.08, 0, 1); }
  function step(dt) {
    var hwy = st.drive === 'hwy', Q = st.run ? (hwy ? 0.30 : 0.20) : 0, air = hwy ? 1 : 0.12;
    if (st.fault !== 'fan') { if (st.T > 0.62) st.fanOn = true; else if (st.T < 0.58) st.fanOn = false; } else st.fanOn = false;
    if (!st.run) st.fanOn = false;
    var flowAir = Math.max(air * (st.run ? 1 : 0.1), st.fanOn ? 0.95 : 0), s = opening();
    var cool = 1.2 * s * st.T * flowAir + 0.05 * st.T + (st.heater && st.run ? 0.03 * st.T : 0);
    st.T = clamp(st.T + (Q - cool) / 4 * dt, 0, 1);
    st.time += dt;
  }
  function hotColor(t) {
    var c1 = [47, 128, 196], c2 = [217, 72, 40], k = clamp((t - 0.2) / 0.8, 0, 1);
    return 'rgb(' + c1.map(function (v, i) { return Math.round(v + (c2[i] - v) * k); }).join(',') + ')';
  }
  var fanAng = 0;
  function draw(dt) {
    var s = opening(), t = st.T;
    needle.setAttribute('transform', 'rotate(' + (-80 + 160 * t).toFixed(1) + ' 390 236)');
    thValve.setAttribute('transform', 'rotate(' + (90 * s).toFixed(1) + ' 150 72)');
    glow.setAttribute('opacity', (0.55 * clamp((t - 0.3) / 0.7, 0, 1)).toFixed(2));
    steam.setAttribute('opacity', t > 0.95 && st.run ? 1 : 0);
    if (st.fanOn && !T.reduced) { fanAng = (fanAng + dt * 900) % 360; }
    fan.setAttribute('transform', 'rotate(' + fanAng.toFixed(1) + ' 96 151)');
    if (st.run && !T.reduced) imp.setAttribute('transform', 'rotate(' + ((st.time * 400) % 360).toFixed(1) + ' 196 258)');
    var col = hotColor(t), sp = st.run && !st.paused && !T.reduced ? dt : 0;
    function run(list, n, vis) {
      list.forEach(function (d) {
        d.t = (d.t + sp * 0.12) % 1;
        var p = paths[n].getPointAtLength ? paths[n].getPointAtLength(d.t * lens[n]) : { x: 0, y: 0 };
        d.el.setAttribute('cx', p.x.toFixed(1)); d.el.setAttribute('cy', p.y.toFixed(1));
        d.el.setAttribute('opacity', st.run ? vis.toFixed(2) : 0);
        d.el.setAttribute('fill', col);
      });
    }
    run(dots.rad, 'rad', s * 0.95);
    run(dots.by, 'by', 0.15 + 0.8 * (1 - s));
    run(dots.heat, 'heat', st.heater ? 0.85 : 0);
    // text
    oTh.textContent = s <= 0.01 ? 'closed' : s >= 0.99 ? 'fully open' : Math.round(s * 100) + '% open';
    oFan.textContent = st.fault === 'fan' ? 'broken (never turns on)' : st.fanOn ? 'on' : 'off';
    oG.textContent = !st.run && t < 0.05 ? 'cold' : t < 0.45 ? 'below normal' : t <= 0.66 ? 'normal' : t < 0.85 ? 'running hot' : 'in the red';
    var m;
    if (!st.run) m = 'Press Start. The engine begins cold, with the thermostat closed.';
    else if (t >= 0.85) m = 'Overheating! In a real car, pull over as soon as it’s safe, turn the engine off, and never open the radiator cap while it’s hot. ' +
      (st.fault === 'closed' ? 'Here the thermostat is stuck closed, so hot coolant can’t reach the radiator.' : st.fault === 'fan' ? 'With no fan and little road speed, too little air flows through the radiator.' : '');
    else if (t > 0.66) m = 'Running hot. Watch the gauge.' + (st.fault === 'fan' && st.drive !== 'hwy' ? ' The fan isn’t helping in slow traffic.' : '');
    else if (t >= 0.45) m = 'Normal operating temperature. The thermostat opens just enough to send the extra heat through the radiator.' + (st.fanOn ? ' In slow traffic, the fan switches on to pull air through the radiator.' : '');
    else if (st.fault === 'open' && st.time > 12) m = 'The thermostat is stuck open, so coolant flows through the radiator even while the engine is cold. It warms up slowly, runs below normal, and the heater stays weak.';
    else m = 'Warming up. The thermostat is closed, so coolant circulates through the engine' + (st.heater ? ' and heater' : '') + ' but not the radiator, keeping the heat in.';
    if (elStatus.textContent !== m) elStatus.textContent = m;
  }
  var lp = T.loop(root, function (dt) {
    if (st.run && !st.paused) { var n = Math.max(1, st.mult); for (var i = 0; i < n * 4; i++) step(dt / 4); }
    draw(dt);
  });
  q('.c-start').addEventListener('click', function () {
    st.T = 0; st.time = 0; st.run = true; st.paused = false; st.fanOn = false;
    q('.c-start').textContent = '↺ Restart from cold'; q('.c-pause').setAttribute('aria-pressed', 'false'); q('.c-pause').textContent = '❚❚ Pause';
    lp.start();
  });
  q('.c-pause').addEventListener('click', function () {
    st.paused = !st.paused;
    this.setAttribute('aria-pressed', st.paused ? 'true' : 'false'); this.textContent = st.paused ? '▶ Resume' : '❚❚ Pause';
  });
  function seg(sel, fn) {
    side.querySelectorAll(sel + ' button').forEach(function (b) {
      b.addEventListener('click', function () {
        side.querySelectorAll(sel + ' button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        fn(b.dataset.v);
      });
    });
  }
  seg('.c-drive', function (v) { st.drive = v; });
  seg('.c-speed', function (v) { st.mult = +v; });
  q('.c-fault').addEventListener('change', function () { st.fault = this.value; });
  q('.c-heater').addEventListener('change', function () { st.heater = this.checked; });
  var INFO = {
    rad: ['Radiator', 'Hot coolant spreads into thin tubes with fins, and air carries the heat away.'],
    res: ['Reservoir', 'Holds extra coolant and shows the level. Check it with the engine cold.'],
    fan: ['Cooling fan', 'Pulls air through the radiator when the car is moving slowly or stopped.'],
    engine: ['Engine and water jacket', 'Coolant flows through passages around the cylinders and picks up heat.'],
    thermo: ['Thermostat', 'A valve that stays closed while the engine warms up, then opens to hold a steady temperature.'],
    pump: ['Water pump', 'Pushes coolant around the loop whenever the engine runs.'],
    heater: ['Heater core', 'A small radiator behind the dashboard. A blower pushes cabin air across it.'],
    gauge: ['Temperature gauge', 'Shows the coolant temperature. Learn where yours normally sits.']
  };
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    function pick() {
      svg.querySelectorAll('[data-part].sel').forEach(function (x) { x.classList.remove('sel'); });
      g.classList.add('sel');
      var p = INFO[g.dataset.part]; elPart.textContent = '';
      var b = D.createElement('b'); b.textContent = p[0] + ': '; elPart.appendChild(b); elPart.appendChild(D.createTextNode(p[1]));
    }
    g.addEventListener('click', pick);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  draw(0);
})(window, document);
