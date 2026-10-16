/* Cars course, Lesson 12 (Thrusters and Fans): fan downforce ("suction") simulator.
   Fans pull air out from under the car; skirts limit how fast outside air leaks back in, so the pressure under the floor
   drops by dp. Downforce = dp × sealed floor area. Tire grip = mu × (weight + downforce) (OpenStax College Physics 2e, 5.1:
   f_max = mu_s N). Upside down, the car stays on the ceiling only if dp × area is more than its weight: dp > m g / area.
   Tesla has not published the pressure drop, the floor area or the car's weight, so those are sliders with assumed values.
   The model runs in node too (module.exports) for /tmp/work_roadster/test_models.js. */
(function (W) {
  'use strict';
  var PA = 101325, G0 = 9.80665;
  var M = {
    downforce: function (dp, A) { return dp * A; },
    ceilingDp: function (m, A) { return m * G0 / A; },
    grip: function (mu, m, D) { return mu * (m * G0 + D); },
    maxG: function (mu, m, D) { return mu * (1 + D / (m * G0)); }
  };
  if (typeof module === 'object' && module.exports) { module.exports = M; return; }
  var D = W.document, root = D.getElementById('tr-w-fans');
  if (!root || !W.TRTrades || !W.TRRoadster) return;
  var T = W.TRTrades, h = T.h, fmt = T.fmt, sv = W.TRRoadster.sv, Plot = W.TRRoadster.Plot;
  root.innerHTML = '';
  root.classList.add('rd-w');
  var st = { dp: 3000, A: 4, m: 1900, mu: 1.0, flip: false };

  var top = h('div', { class: 'rd-top' }); root.appendChild(top);
  var segV = h('div', { class: 'tr-seg', role: 'group', 'aria-label': 'Where the car is' }); top.appendChild(segV);
  [['road', 'On the road'], ['ceil', 'Upside down']].forEach(function (o, i) {
    var b = h('button', { type: 'button', 'aria-pressed': i ? 'false' : 'true', 'data-v': o[0] }); b.textContent = o[1]; segV.appendChild(b);
    b.addEventListener('click', function () { st.flip = o[0] === 'ceil'; segV.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update(); });
  });
  var grid = h('div', { class: 'tr-w-grid rd-grid2' }); root.appendChild(grid);
  var leftCol = h('div', { class: 'rd-left' }); grid.appendChild(leftCol);
  var stageWrap = h('div', { class: 'rd-stage' }); leftCol.appendChild(stageWrap);
  var side = h('div', { class: 'rd-side' }); grid.appendChild(side);

  var svg = sv('svg', { viewBox: '0 0 640 300', role: 'img', 'aria-label': 'Side view of the car with skirts and fans pulling air from under the floor' }, stageWrap);
  svg.innerHTML = '<defs><linearGradient id="rf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1510"/><stop offset="1" stop-color="#16271e"/></linearGradient>' +
    '<marker id="rf-ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-ahb"/></marker>' +
    '<marker id="rf-ahw" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-ahw"/></marker>' +
    '<marker id="rf-aha" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rd-aha"/></marker></defs>' +
    '<rect width="640" height="300" fill="url(#rf-sky)"/>';
  var scene = sv('g', null, svg);
  var GY = 236;
  sv('rect', { class: 'rd-road', x: 0, y: GY, width: 640, height: 80 }, scene);
  sv('line', { class: 'rd-roadedge', x1: 0, x2: 640, y1: GY, y2: GY }, scene);
  var surfT = sv('text', { class: 'rd-gl', x: 620, y: GY + 22, 'text-anchor': 'end' }, scene);
  // the car, 2.2x the local drawing, centered
  var car = sv('g', { transform: 'translate(100,' + GY + ') scale(2.2)' }, scene);
  var low = sv('rect', { class: 'rf-low', x: 22, y: -11, width: 156, height: 9, rx: 2 }, car);
  sv('path', { class: 'rd-car', d: 'M5,-14 L3,-34 Q4,-44 16,-47 L52,-51 Q76,-55 94,-69 Q104,-76 118,-76 L128,-75 Q140,-71 154,-58 L186,-48 Q199,-44 201,-32 L200,-16 Q199,-11 194,-11 L180,-11 A20,20 0 0 0 140,-11 L60,-11 A20,20 0 0 0 20,-11 L9,-11 Q5,-11 5,-14 Z' }, car);
  sv('path', { class: 'rd-glass', d: 'M98,-66 Q106,-72 118,-72 L127,-71 Q137,-68 148,-58 L102,-57 Z' }, car);
  sv('path', { class: 'rf-skirt', d: 'M60,-11 V-2 M140,-11 V-2 M60,-2.5 H140' }, car);
  sv('path', { class: 'rf-duct', d: 'M100,-12 Q100,-22 26,-24' }, car);
  var fans = [];
  [[24, -26], [24, -38]].forEach(function (p) {
    var g = sv('g', { transform: 'translate(' + p[0] + ',' + p[1] + ')' }, car);
    sv('circle', { class: 'rf-fanring', r: 5.6 }, g);
    var bl = sv('g', null, g);
    for (var k = 0; k < 4; k++) sv('path', { class: 'rf-blade', d: 'M0,0 L4.6,-1.4 L4.6,1.4 Z', transform: 'rotate(' + k * 90 + ')' }, bl);
    fans.push(bl);
  });
  [40, 160].forEach(function (cx) { sv('circle', { class: 'rd-tire', cx: cx, cy: -11, r: 19 }, car); sv('circle', { class: 'rd-rim', cx: cx, cy: -11, r: 11 }, car); });
  var streams = sv('g', null, car), puffs = [];
  for (var q = 0; q < 18; q++) puffs.push({ el: sv('circle', { class: 'rd-puff', r: 0 }, streams), s: q / 18 });
  // outside air pushing on the top, and the forces
  var airG = sv('g', null, scene), airArrows = [];
  for (var a = 0; a < 6; a++) airArrows.push(sv('path', { class: 'rf-air', 'marker-end': 'url(#rf-aha)' }, airG));
  // forces live outside the mirrored scene, so weight always points down
  var forces = sv('g', null, svg);
  var arD = sv('path', { class: 'rd-arB', 'marker-end': 'url(#rf-ahb)' }, forces), arW = sv('path', { class: 'rd-arW', 'marker-end': 'url(#rf-ahw)' }, forces);
  var tD = sv('text', { class: 'rd-art rd-arBt' }, forces), tW = sv('text', { class: 'rd-art rd-arWt' }, forces);
  var badge = sv('g', { class: 'rf-badge' }, svg);
  var badgeR = sv('rect', { x: 14, y: 12, width: 210, height: 30, rx: 15 }, badge);
  var badgeT = sv('text', { x: 119, y: 32, 'text-anchor': 'middle' }, badge);

  var ctl = h('div', { class: 'rd-ctl' }); side.appendChild(ctl);
  function slider(key, label, min, max, step, aria) {
    var lab = h('label', { class: 'tr-field' });
    lab.innerHTML = '<span class="rd-fl">' + label + ' <span class="v"></span></span>';
    var inp = h('input', { type: 'range', min: min, max: max, step: step, value: st[key], 'aria-label': aria });
    lab.appendChild(inp); ctl.appendChild(lab);
    inp.addEventListener('input', function () { st[key] = +inp.value; update(); });
    return { inp: inp, v: lab.querySelector('.v') };
  }
  var sl = {
    dp: slider('dp', 'Pressure drop under the car', 0, 15000, 100, 'Pressure drop under the car in pascals'),
    A: slider('A', 'Sealed floor area (assumed)', 1, 8, 0.1, 'Sealed floor area in square meters'),
    m: slider('m', 'Car mass (assumed)', 1000, 3000, 50, 'Car mass in kilograms'),
    mu: slider('mu', 'Tire grip, μ', 0.3, 1.5, 0.05, 'Tire grip coefficient')
  };
  var tiles = h('div', { class: 'rd-tiles rf-tiles', 'aria-live': 'polite' }); leftCol.appendChild(tiles);
  var summary = h('p', { class: 'rd-sum' }); leftCol.appendChild(summary);
  var plots = h('div', { class: 'rd-plots rd-plots1' }); root.appendChild(plots);
  var P = Plot(plots, { title: 'Most grip for braking or cornering, by pressure drop', ylab: 'g', xlab: 'pressure drop (kPa)' });
  var note = h('p', { class: 'tr-w-note' }); root.appendChild(note);
  note.innerHTML = '<b>Assumed, not published by Tesla:</b> the pressure drop, the sealed area and the car’s weight. Upside down, the car stays up only while the suction beats its weight; to drive there, the tires also need grip, which is μ × (suction − weight). The model leaves out the lift or downforce from the body and wings, which grows with the square of the speed; the fans work even when the car is parked.';

  function tile(b, s, cls) { return '<div class="rd-tile' + (cls ? ' ' + cls : '') + '"><b>' + b + '</b><span>' + s + '</span></div>'; }
  var spin = 0;
  function update() {
    sl.dp.v.textContent = fmt(st.dp) + ' Pa (' + fmt(st.dp / PA * 100, 1) + '% of an atmosphere)';
    sl.A.v.textContent = fmt(st.A, 1) + ' m²';
    sl.m.v.textContent = fmt(st.m) + ' kg';
    sl.mu.v.textContent = fmt(st.mu, 2);
    var Dn = M.downforce(st.dp, st.A), Wt = st.m * G0, need = M.ceilingDp(st.m, st.A), g0 = st.mu, g1 = M.maxG(st.mu, st.m, Dn);
    var holds = Dn > Wt;
    tiles.innerHTML = tile(fmt(Dn / 1000, 1) + ' kN', 'downforce from the fans (like ' + fmt(Dn / G0) + ' kg more)') +
      tile(fmt(g0, 2) + ' g → ' + fmt(g1, 2) + ' g', 'most grip: without → with fans', 'hi') +
      tile(fmt(need) + ' Pa', 'drop needed to hang upside down (' + fmt(need / PA * 100, 1) + '% of an atmosphere)') +
      tile(st.flip ? (holds ? fmt((Dn - Wt) / 1000, 1) + ' kN' : 'falls') : fmt(Wt / 1000, 1) + ' kN', st.flip ? (holds ? 'pressing the car to the ceiling' : 'suction is less than weight') : 'weight', st.flip && !holds ? 'bad' : '');
    summary.textContent = 'A pressure drop of ' + fmt(st.dp) + ' pascals over ' + fmt(st.A, 1) + ' square meters makes ' + fmt(Dn / 1000, 1) + ' kN of downforce, so the tires can grip up to ' + fmt(g1, 2) + ' g instead of ' + fmt(g0, 2) + ' g. ' +
      'To hang upside down, this ' + fmt(st.m) + ' kg car needs a drop of ' + fmt(need) + ' pascals, just ' + fmt(need / PA * 100, 1) + '% of the air’s pressure. ' + (st.flip ? (holds ? 'At this setting it holds.' : 'At this setting it falls.') : '');
    var xs = [], ys = [];
    for (var i = 0; i <= 60; i++) { var dp = 15000 * i / 60; xs.push(dp / 1000); ys.push(M.maxG(st.mu, st.m, M.downforce(dp, st.A))); }
    P.draw(xs, [{ y: ys, cls: 'c1' }], { xmax: 15, refRight: true, refs: [{ y: st.mu, label: 'no fans', cls: 'g' }] });
    P.cursor(st.dp / 1000);
    // vertical marker for the ceiling requirement
    var svgP = P.el.querySelector('svg'), old = svgP.querySelector('.rf-need'); if (old) old.remove();
    if (need <= 15000) {
      var X = 46 + (320 - 46 - 10) * (need / 15000);
      var g = sv('g', { class: 'rf-need' }, svgP);
      sv('line', { class: 'rd-ref w', x1: X, x2: X, y1: 10, y2: 140 }, g);
      sv('text', { class: 'rd-reft w', x: X + 4, y: 136 }, g).textContent = 'hangs upside down →';
    }
    drawScene(Dn, Wt, holds);
  }
  function drawScene(Dn, Wt, holds) {
    var f = st.flip;
    scene.setAttribute('transform', f ? 'translate(0,300) scale(1,-1)' : '');
    surfT.setAttribute('transform', f ? 'translate(0,' + (2 * GY + 22 - 6) + ') scale(1,-1)' : '');
    surfT.textContent = f ? 'ceiling' : 'road';
    var need = M.ceilingDp(st.m, st.A), k = Math.min(1, st.dp / Math.max(need, 1));
    low.setAttribute('opacity', (0.15 + 0.75 * Math.min(1, st.dp / 8000)).toFixed(2));
    var sc = 80 / Math.max(Dn, Wt, 1), cx = 100 + 2.2 * 100, y0 = f ? 152 : 148, dir = f ? -1 : 1;
    var lD = Dn * sc, lW = Wt * sc;
    arD.setAttribute('d', Dn > 0 ? 'M' + (cx - 40) + ',' + y0 + ' v' + (dir * lD) : 'M0,0');
    arW.setAttribute('d', 'M' + (cx + 40) + ',' + y0 + ' v' + lW);
    tD.setAttribute('x', cx - 48); tD.setAttribute('y', y0 + dir * lD * 0.6); tD.setAttribute('text-anchor', 'end'); tD.textContent = Dn > 0 ? 'suction' : '';
    tW.setAttribute('x', cx + 48); tW.setAttribute('y', y0 + lW * 0.6); tW.textContent = 'weight';
    airArrows.forEach(function (p, i) {
      var x = 160 + i * 52, len = 10 + 26 * k;
      p.setAttribute('d', 'M' + x + ',' + (GY - 200) + ' v' + len.toFixed(1));
      p.setAttribute('opacity', st.dp > 0 ? 0.85 : 0);
    });
    badge.style.display = f ? '' : 'none';
    badge.setAttribute('class', 'rf-badge ' + (holds ? 'ok' : 'bad'));
    badgeT.textContent = holds ? 'Holds on the ceiling' : 'Falls: not enough suction';
  }
  var flow = 0;
  function frame(dt) {
    var rate = Math.sqrt(st.dp / 3000);
    spin = (spin + dt * 900 * rate) % 360;
    fans.forEach(function (b) { b.setAttribute('transform', 'rotate(' + spin.toFixed(1) + ')'); });
    flow = (flow + dt * 0.9 * (0.3 + rate)) % 1;
    puffs.forEach(function (p) {
      var u = (p.s + flow) % 1, x, y;
      if (st.dp <= 0) { p.el.setAttribute('r', 0); return; }
      if (u < 0.55) { var v = u / 0.55; x = 100 - 74 * v; y = -12 - 12 * v * v; } else { var w = (u - 0.55) / 0.45; x = 24 - 40 * w; y = (p.s * 18 < 9 ? -26 : -38) + w * 2; }
      p.el.setAttribute('cx', x.toFixed(1)); p.el.setAttribute('cy', y.toFixed(1)); p.el.setAttribute('r', 1.6);
      p.el.setAttribute('opacity', (0.25 + 0.5 * Math.sin(Math.PI * u)).toFixed(2));
    });
  }
  if (!T.reduced && T.loop) T.loop(stageWrap, frame); else frame(0);
  update();
})(typeof window !== 'undefined' ? window : this);
