/* HVAC course, Lessons 4 and 6: the vapor-compression refrigeration cycle, as an air conditioner or a heat pump.
   Refrigerant dots flow around the loop, colored by state: hot gas, condensing, warm liquid, cold liquid-vapor mix, cool vapor.
   A reversing valve swaps the two coils' jobs. Readouts: coil temperatures (air temperature +/- a gap the user picks, a model
   assumption) and the Carnot limits on COP from OpenStax College Physics 2e 15.4-15.5:
   COP_cool <= Tc/(Th - Tc), COP_heat <= Th/(Th - Tc), temperatures in kelvins. Motion is decorative; stepping works without it. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-refcycle');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var les = D.getElementById('tr-lesson');
  var startMode = les && les.dataset.lesson === 'heat-pumps' ? 'heat' : 'cool';
  root.innerHTML = '';
  root.classList.add('hv-stack');
  var stage = T.h('div', { class: 'tr-w-stage' }); root.appendChild(stage);
  var cols = T.h('div', { class: 'hv-cols' }); root.appendChild(cols);
  var side = T.h('div'); cols.appendChild(side);
  var side2 = T.h('div'); cols.appendChild(side2);
  var svg = S('svg', { viewBox: '0 0 520 384', role: 'img', class: 'hv-rc', 'aria-label': 'The refrigeration loop: compressor, outdoor coil, expansion device and indoor coil, with a reversing valve' }, stage);
  svg.innerHTML = '<defs>' +
    '<marker id="rc-ah" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rc-fh"/></marker>' +
    '<marker id="rc-ac" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rc-fc"/></marker>' +
    '<marker id="rc-aw" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rc-fw"/></marker>' +
    '<marker id="rc-ae" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="9" markerHeight="9" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="rc-fe"/></marker></defs>';

  // ---------- geometry ----------
  function zig(cx, xo, n) { // coil tube from top connection (cx,96) to bottom connection (cx,244)
    var pts = [[cx, 96]], x = cx;
    for (var k = 0; k < n; k++) { var y = 102 + k * 18; pts.push([x, y]); x = (x === cx ? xo : cx); pts.push([x, y]); }
    pts.push([x, 244]); return pts;
  }
  var IN = zig(140, 100, 8), OUT = zig(380, 420, 8);
  function rev(a) { return a.slice().reverse(); }
  // legs: [points, state]  states: hot, cond (in-coil profile), liq, mix, evap (in-coil profile), suc, comp
  var LEGS = {
    cool: [
      [[[320, 320], [320, 302], [334, 290], [380, 290], [380, 244]], 'hot'],
      [rev(OUT), 'cond'],
      [[[380, 96], [380, 60], [200, 60]], 'liq'],
      [[[200, 60], [140, 60], [140, 96]], 'mix'],
      [IN, 'evap'],
      [[[140, 244], [140, 290], [286, 290], [300, 302], [300, 320]], 'suc'],
      [[[300, 320], [302, 334], [310, 340], [318, 334], [320, 320]], 'comp']],
    heat: [
      [[[320, 320], [320, 302], [286, 290], [140, 290], [140, 244]], 'hot'],
      [rev(IN), 'cond'],
      [[[140, 96], [140, 60], [200, 60]], 'liq'],
      [[[200, 60], [380, 60], [380, 96]], 'mix'],
      [OUT, 'evap'],
      [[[380, 244], [380, 290], [334, 290], [300, 302], [300, 320]], 'suc'],
      [[[300, 320], [302, 334], [310, 340], [318, 334], [320, 320]], 'comp']]
  };
  // stage -> legs (1 compress: comp+hot, 2 condense: cond, 3 expand: liq+mix, 4 evaporate: evap+suc)
  var STAGE_LEGS = [[6, 0], [1], [2, 3], [4, 5]];
  var COL = { hot: [228, 87, 46], cond: [240, 140, 46], liq: [232, 163, 61], mix: [47, 127, 193], vap: [86, 182, 217] };
  function mixc(a, b, f) { return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * f); }).join(',') + ')'; }
  function colorAt(state, f) {
    if (state === 'hot') return mixc(COL.hot, COL.hot, 0);
    if (state === 'cond') return f < 0.15 ? mixc(COL.hot, COL.cond, f / 0.15) : f < 0.85 ? mixc(COL.cond, COL.liq, (f - 0.15) / 0.7 * 0.35) : mixc(COL.cond, COL.liq, 0.35 + 0.65 * (f - 0.85) / 0.15);
    if (state === 'liq') return mixc(COL.liq, COL.liq, 0);
    if (state === 'mix') return mixc(COL.mix, COL.mix, 0);
    if (state === 'evap') return f < 0.85 ? mixc(COL.mix, COL.vap, f / 0.85 * 0.45) : mixc(COL.mix, COL.vap, 0.45 + 0.55 * (f - 0.85) / 0.15);
    if (state === 'suc') return mixc(COL.vap, COL.vap, 0);
    return mixc(COL.vap, COL.hot, f);
  }
  function plen(p) { var s = 0; for (var i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; }
  function at(p, dist) { // point at distance dist along polyline p
    for (var i = 1; i < p.length; i++) {
      var L = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
      if (dist <= L || i === p.length - 1) { var f = L ? Math.min(1, dist / L) : 0; return [p[i - 1][0] + (p[i][0] - p[i - 1][0]) * f, p[i - 1][1] + (p[i][1] - p[i - 1][1]) * f]; }
      dist -= L;
    }
    return p[p.length - 1];
  }
  function sub(p, f0, f1) { // sub-polyline between fractions
    var L = plen(p), a = f0 * L, b = f1 * L, out = [at(p, a)], acc = 0;
    for (var i = 1; i < p.length; i++) { acc += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (acc > a && acc < b) out.push(p[i]); }
    out.push(at(p, b)); return out;
  }
  function pd(p) { return 'M' + p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' L'); }

  // ---------- static drawing ----------
  S('rect', { class: 'rc-outbg', x: 250, y: 6, width: 266, height: 374, rx: 10 }, svg);
  S('path', { class: 'rc-wall', d: 'M250,10 V376' }, svg);
  S('text', { class: 'hv-t hv-tb rc-cap', x: 16, y: 24 }, svg).textContent = 'INSIDE';
  S('text', { class: 'hv-t hv-tb rc-cap', x: 504, y: 24, 'text-anchor': 'end' }, svg).textContent = 'OUTSIDE';
  function coilFrame(x, key, name) {
    var g = S('g', { 'data-part': key, tabindex: 0, role: 'button', 'aria-label': name }, svg);
    S('rect', { class: 'rc-coil', x: x, y: 92, width: 56, height: 156, rx: 5 }, g);
    for (var i = 0; i < 10; i++) S('path', { class: 'rc-fin', d: 'M' + (x + 4 + i * 5.4).toFixed(1) + ',96 V244' }, g);
    return g;
  }
  var gIn = coilFrame(92, 'incoil', 'Indoor coil'), gOut = coilFrame(372, 'outcoil', 'Outdoor coil');
  var pipeBase = S('g', null, svg), pipeCol = S('g', null, svg);
  var gExp = S('g', { 'data-part': 'exp', tabindex: 0, role: 'button', 'aria-label': 'Expansion device' }, svg);
  S('rect', { class: 'rc-dev', x: 186, y: 50, width: 28, height: 20, rx: 4 }, gExp);
  S('path', { class: 'rc-throat', d: 'M188,55 L198,58 V62 L188,65 M212,55 L202,58 V62 L212,65' }, gExp);
  S('text', { class: 'hv-ts', x: 200, y: 42, 'text-anchor': 'middle' }, svg).textContent = 'expansion device';
  var gVal = S('g', { 'data-part': 'valve', tabindex: 0, role: 'button', 'aria-label': 'Reversing valve' }, svg);
  S('rect', { class: 'rc-valve', x: 284, y: 278, width: 52, height: 26, rx: 6 }, gVal);
  var vCool = S('path', { class: 'rc-vpath', d: 'M288,290 Q296,292 300,302 M332,290 Q324,292 320,302' }, gVal);
  var vHeat = S('path', { class: 'rc-vpath', d: 'M288,290 Q312,292 320,302 M332,290 Q308,292 300,302' }, gVal);
  var tVal = S('text', { class: 'hv-ts', x: 282, y: 326, 'text-anchor': 'end' }, svg), tVal2 = S('text', { class: 'hv-ts', x: 282, y: 339, 'text-anchor': 'end' }, svg);
  tVal.textContent = 'reversing valve';
  var dotsG = S('g', null, svg);
  var gComp = S('g', { 'data-part': 'comp', tabindex: 0, role: 'button', 'aria-label': 'Compressor' }, svg);
  var compBody = S('g', null, gComp);
  S('circle', { class: 'rc-comp', cx: 310, cy: 338, r: 20 }, compBody);
  S('path', { class: 'rc-compl', d: 'M298,332 H322 M298,338 H322 M298,344 H322' }, compBody);
  S('text', { class: 'hv-t', x: 310, y: 376, 'text-anchor': 'middle' }, svg).textContent = 'compressor';
  S('path', { class: 'rc-bolt', d: 'M354,326 L342,340 L350,340 L340,356 L358,336 L350,336 Z' }, svg);
  S('text', { class: 'hv-ts', x: 362, y: 346 }, svg).textContent = 'work in, W';
  S('text', { class: 'hv-ts', x: 362, y: 358 }, svg).textContent = '(electricity)';
  function fan(cx, cy, key, name) {
    var g = S('g', { 'data-part': key, tabindex: 0, role: 'button', 'aria-label': name }, svg);
    S('circle', { class: 'rc-fanring', cx: cx, cy: cy, r: 17 }, g);
    var bl = S('g', null, g);
    for (var i = 0; i < 3; i++) S('ellipse', { class: 'rc-blade', cx: cx, cy: cy - 8, rx: 4.5, ry: 8.5, transform: 'rotate(' + (i * 120) + ' ' + cx + ' ' + cy + ')' }, bl);
    S('circle', { class: 'rc-hub', cx: cx, cy: cy, r: 3 }, g);
    return { g: g, bl: bl, cx: cx, cy: cy };
  }
  var fIn = fan(40, 170, 'blower', 'Indoor blower'), fOut = fan(486, 170, 'ofan', 'Outdoor fan');
  var air = {};
  [['inA', 'M60,150 L88,150 M60,190 L88,190'], ['inB', 'M152,150 L196,150 M152,190 L196,190'], ['outA', 'M318,150 L368,150 M318,190 L368,190'], ['outB', 'M432,150 L462,150 M432,190 L462,190']]
    .forEach(function (a) { air[a[0]] = S('path', { class: 'rc-air', d: a[1] }, svg); });
  var heatIn = S('path', { class: 'rc-q', d: '' }, svg), heatOut = S('path', { class: 'rc-q', d: '' }, svg);
  var tQin = S('text', { class: 'hv-tag', x: 0, y: 0, 'text-anchor': 'middle' }, svg), tQout = S('text', { class: 'hv-tag', x: 0, y: 0, 'text-anchor': 'middle' }, svg);
  var tAirIn = S('text', { class: 'hv-t', x: 40, y: 206, 'text-anchor': 'middle' }, svg), tAirOut = S('text', { class: 'hv-t', x: 486, y: 206, 'text-anchor': 'middle' }, svg);
  var tAirIn2 = S('text', { class: 'hv-ts', x: 40, y: 219, 'text-anchor': 'middle' }, svg), tAirOut2 = S('text', { class: 'hv-ts', x: 486, y: 219, 'text-anchor': 'middle' }, svg);
  function lbl(x, anchor) { return [0, 1, 2].map(function (i) { return S('text', { class: i === 0 ? 'hv-t hv-tb' : (i === 1 ? 'hv-t' : 'hv-tag'), x: x, y: 262 + i * 13, 'text-anchor': anchor }, svg); }); }
  var LIn = lbl(132, 'end'), LOut = lbl(388, 'start');
  function pill(x, y) { var g = S('g', null, svg); var r = S('rect', { class: 'rc-pill', x: x - 46, y: y - 11, width: 92, height: 16, rx: 8 }, g); var tt = S('text', { class: 'hv-tag rc-pillt', x: x, y: y + 1, 'text-anchor': 'middle' }, g); return { r: r, t: tt }; }
  var pTop = pill(300, 82), pBot = pill(212, 312);
  var tracer = S('circle', { class: 'rc-tracer', r: 8, cx: 0, cy: 0 }, svg);

  // ---------- side panel ----------
  side.innerHTML =
    '<div class="hv-head"><h3>The refrigeration cycle</h3><span class="rc-sub"></span></div>' +
    '<div class="tr-seg rc-mode" role="group" aria-label="Mode"><button type="button" data-v="cool">❄ Cooling (air conditioner)</button><button type="button" data-v="heat">🔥 Heating (heat pump)</button></div>' +
    '<div class="hv-chips rc-chips" aria-hidden="true"><span>1 Compress</span><span>2 Condense</span><span>3 Expand</span><span>4 Evaporate</span></div>' +
    '<p class="hv-say rc-say" aria-live="polite"></p>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn pri rc-play"></button><button type="button" class="hs-btn rc-prev" aria-label="Previous stage">◂ Step</button><button type="button" class="hs-btn rc-next" aria-label="Next stage">Step ▸</button></div>' +
    '<div class="tr-partname rc-part" aria-live="polite"><b>Tap a part</b> to see what it does.</div>';
  side2.innerHTML =
    '<label class="tr-field">Indoor air: <span class="v rc-v1"></span><input type="range" class="rc-tin" min="60" max="85" step="1" aria-label="Indoor air temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Outdoor air: <span class="v rc-v2"></span><input type="range" class="rc-tout" min="-10" max="115" step="1" aria-label="Outdoor air temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Coil-to-air gap (a model setting): <span class="v rc-v3"></span><input type="range" class="rc-gap" min="5" max="35" step="1" value="25" aria-label="How much colder or hotter each coil runs than its air, in Fahrenheit degrees"></label>' +
    '<div class="tr-out rc-read" aria-live="polite"></div>' +
    '<p class="hv-legend"><span><i style="background:rgb(228,87,46)"></i>hot gas</span><span><i style="background:rgb(240,140,46)"></i>condensing</span><span><i style="background:rgb(232,163,61)"></i>warm liquid</span><span><i style="background:rgb(47,127,193)"></i>cold liquid + vapor</span><span><i style="background:rgb(86,182,217)"></i>cool vapor</span></p>';
  var q = function (s) { return side.querySelector(s) || side2.querySelector(s); };
  var iIn = q('.rc-tin'), iOut = q('.rc-tout'), iGap = q('.rc-gap'), bPlay = q('.rc-play'), elSay = q('.rc-say'), elOut = q('.rc-read'), elPart = q('.rc-part');
  var chips = side.querySelectorAll('.rc-chips span');

  // ---------- units ----------
  function umode() { try { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; } catch (e) { return 'both'; } }
  function fC(f) { return (f - 32) * 5 / 9; }
  function mn(x) { return String(Math.round(x)).replace('-', '−'); }
  function tf(f) { var m = umode(), a = mn(f) + '°F', b = mn(fC(f)) + '°C'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function tshort(f) { return umode() === 'metric' ? mn(fC(f)) + '°C' : mn(f) + '°F'; }
  function gapS(g) { var m = umode(), a = Math.round(g) + ' F°', b = (g * 5 / 9).toFixed(1) + ' C°'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function K(f) { return fC(f) + 273.15; }

  // ---------- state ----------
  var st = { mode: startMode, play: !T.reduced, pos: 0, stage: 0 };
  var path = [], legStart = [], legLen = [], total = 0, dots = [];
  function build() {
    var legs = LEGS[st.mode]; path = legs; legStart = []; legLen = []; total = 0;
    legs.forEach(function (l) { legStart.push(total); var L = plen(l[0]); legLen.push(L); total += L; });
    pipeBase.innerHTML = ''; pipeCol.innerHTML = '';
    legs.forEach(function (l) { if (l[1] !== 'comp') S('path', { class: 'rc-pipe', d: pd(l[0]) }, pipeBase); });
    legs.forEach(function (l) {
      var p = l[0], s = l[1];
      if (s === 'cond') { [[0, 0.15, 'hot'], [0.15, 0.85, 'cond'], [0.85, 1, 'liq']].forEach(function (c) { S('path', { class: 'rc-st rc-' + c[2], d: pd(sub(p, c[0], c[1])) }, pipeCol); }); }
      else if (s === 'evap') { [[0, 0.85, 'mix'], [0.85, 1, 'vap']].forEach(function (c) { S('path', { class: 'rc-st rc-' + c[2], d: pd(sub(p, c[0], c[1])) }, pipeCol); }); }
      else if (s !== 'comp') S('path', { class: 'rc-st rc-' + (s === 'suc' ? 'vap' : s), d: pd(p) }, pipeCol);
    });
    if (!dots.length) for (var i = 0; i < 34; i++) dots.push({ el: S('circle', { class: 'rc-dot', r: 3.6 }, dotsG), s: i / 34 });
  }
  function locate(s) {
    var dd = ((s % 1) + 1) % 1 * total;
    for (var i = 0; i < legStart.length; i++) {
      if (dd < legStart[i] + legLen[i] || i === legStart.length - 1) {
        var f = Math.max(0, Math.min(1, (dd - legStart[i]) / legLen[i])), p = at(path[i][0], dd - legStart[i]);
        return { x: p[0], y: p[1], leg: i, f: f };
      }
    }
  }
  function stageOf(leg) { for (var k = 0; k < 4; k++) if (STAGE_LEGS[k].indexOf(leg) >= 0) return k; return 0; }
  function stageMid(k) {
    var a, b;
    if (k === 0) { a = legStart[6]; b = total + legLen[0]; }
    else { var ls = STAGE_LEGS[k]; a = legStart[ls[0]]; b = legStart[ls[ls.length - 1]] + legLen[ls[ls.length - 1]]; }
    return ((a + b) / 2 % total) / total;
  }
  function temps() {
    var tin = +iIn.value, tout = +iOut.value, gap = +iGap.value, cool = st.mode === 'cool';
    var cold = cool ? tin : tout, hot = cool ? tout : tin;
    return { tin: tin, tout: tout, gap: gap, cool: cool, cold: cold, hot: hot, evap: cold - gap, cond: hot + gap };
  }
  function cop(tc, th, heating) { var a = K(tc), b = K(th); if (b - a <= 0.01) return Infinity; return heating ? b / (b - a) : a / (b - a); }
  function fmtCop(c) { return isFinite(c) ? (c >= 100 ? T.fmt(c, 0) : c.toFixed(1)) : '∞'; }
  function texts(k, t) {
    var cool = t.cool;
    return [
      'The <b>compressor</b> squeezes cool, low-pressure vapor into <b>hot, high-pressure vapor</b>. This is where the electricity goes in: the work W.' + (cool ? '' : ' The reversing valve sends the hot gas to the indoor coil.'),
      cool ? 'In the <b>outdoor coil</b> (the condenser) the hot vapor gives its heat to the outdoor air and condenses into a warm liquid. It condenses at about ' + tf(t.cond) + ', hotter than the ' + tf(t.tout) + ' outdoor air, so heat flows out of it.'
           : 'In the <b>indoor coil</b> (now the condenser) the hot vapor condenses at about ' + tf(t.cond) + ', warmer than the ' + tf(t.tin) + ' room, heating the air the blower sends through the house.',
      'The warm, high-pressure liquid squeezes through the <b>expansion device</b>. Its pressure drops, some of it flashes into vapor, and that chills the rest to about ' + tf(t.evap) + '.',
      cool ? 'In the <b>indoor coil</b> (the evaporator) the cold refrigerant boils at about ' + tf(t.evap) + ', colder than the ' + tf(t.tin) + ' room air, soaking up its heat. Water vapor condenses on the coil too. Cool vapor returns to the compressor.'
           : 'In the <b>outdoor coil</b> (now the evaporator) the refrigerant boils at about ' + tf(t.evap) + ', colder than the ' + tf(t.tout) + ' outdoor air, so it soaks up heat even from cold air. The vapor returns to the compressor.'
    ][k];
  }
  var PARTS = {
    comp: ['Compressor', 'Squeezes low-pressure vapor into hot, high-pressure vapor. It uses most of the electricity. In a split system it sits in the outdoor unit.'],
    incoil: ['Indoor coil', 'A coil of tubing and thin fins. In an air conditioner it’s the evaporator, soaking up heat (and condensing water); in a heat pump’s heating mode it’s the condenser, releasing heat.'],
    outcoil: ['Outdoor coil', 'Dumps heat outdoors when cooling (the condenser). In a heat pump’s heating mode it becomes the evaporator, gathering heat from the outdoor air.'],
    exp: ['Expansion device', 'A narrow opening, such as a thermostatic or electronic expansion valve or a fixed orifice. The pressure drop chills the refrigerant.'],
    valve: ['Reversing valve', 'Heat pumps only. It switches which coil gets the hot gas from the compressor, so the coils trade jobs. A plain air conditioner doesn’t have one.'],
    blower: ['Indoor blower', 'Pushes house air across the indoor coil and through the ducts.'],
    ofan: ['Outdoor fan', 'Pulls outdoor air through the outdoor coil.']
  };
  function showPart(k) {
    var p = PARTS[k]; if (!p) return;
    svg.querySelectorAll('[data-part]').forEach(function (g) { g.classList.toggle('sel', g.dataset.part === k); });
    elPart.innerHTML = '<b>' + p[0] + ':</b> ' + p[1];
  }
  svg.querySelectorAll('[data-part]').forEach(function (g) {
    g.addEventListener('click', function () { showPart(g.dataset.part); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPart(g.dataset.part); } });
  });
  function setText(el, s) { if (el.textContent !== s) el.textContent = s; }
  function update() {
    var t = temps(), cool = t.cool;
    setText(q('.rc-v1'), tf(t.tin)); setText(q('.rc-v2'), tf(t.tout)); setText(q('.rc-v3'), gapS(t.gap));
    setText(q('.rc-sub'), cool ? 'as an air conditioner' : 'as a heat pump, heating');
    q('.rc-mode').querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.v === st.mode ? 'true' : 'false'); });
    setText(LIn[0], 'indoor coil'); setText(LIn[1], cool ? 'evaporator' : 'condenser'); setText(LIn[2], cool ? 'boils at ' + tshort(t.evap) : 'condenses at ' + tshort(t.cond));
    setText(LOut[0], 'outdoor coil'); setText(LOut[1], cool ? 'condenser' : 'evaporator'); setText(LOut[2], cool ? 'condenses at ' + tshort(t.cond) : 'boils at ' + tshort(t.evap));
    LIn[2].setAttribute('class', 'hv-tag ' + (cool ? 'rc-tcold' : 'rc-thot')); LOut[2].setAttribute('class', 'hv-tag ' + (cool ? 'rc-thot' : 'rc-tcold'));
    setText(tAirIn, tshort(t.tin)); setText(tAirIn2, 'room air');
    setText(tAirOut, tshort(t.tout)); setText(tAirOut2, 'outdoor air');
    setText(pTop.t, cool ? 'high pressure' : 'low pressure'); setText(pBot.t, cool ? 'low pressure' : 'high pressure');
    pTop.r.setAttribute('class', 'rc-pill ' + (cool ? 'rc-phi' : 'rc-plo')); pBot.r.setAttribute('class', 'rc-pill ' + (cool ? 'rc-plo' : 'rc-phi'));
    setText(tVal2, cool ? '(heat pumps only)' : 'set for heating');
    gVal.classList.toggle('rc-dim', cool);
    vCool.style.display = cool ? '' : 'none'; vHeat.style.display = cool ? 'none' : '';
    function airc(el, hot, mk) { el.setAttribute('class', 'rc-air ' + (hot ? 'rc-airh' : 'rc-airc')); el.setAttribute('marker-end', 'url(#rc-a' + mk + ')'); }
    if (cool) { airc(air.inA, true, 'w'); airc(air.inB, false, 'c'); airc(air.outA, true, 'w'); airc(air.outB, true, 'h'); }
    else { airc(air.inA, false, 'c'); airc(air.inB, true, 'h'); airc(air.outA, false, 'c'); airc(air.outB, false, 'e'); }
    if (cool) { heatIn.setAttribute('d', 'M58,64 C80,66 98,74 108,88'); heatOut.setAttribute('d', 'M412,88 C422,74 440,66 462,64'); }
    else { heatIn.setAttribute('d', 'M462,64 C440,66 422,74 412,88'); heatOut.setAttribute('d', 'M108,88 C98,74 80,66 58,64'); }
    heatIn.setAttribute('marker-end', 'url(#rc-ac)'); heatOut.setAttribute('marker-end', 'url(#rc-ah)');
    heatIn.setAttribute('class', 'rc-q rc-qin'); heatOut.setAttribute('class', 'rc-q rc-qout');
    tQin.setAttribute('x', cool ? 16 : 504); tQin.setAttribute('y', 50); tQin.setAttribute('text-anchor', cool ? 'start' : 'end'); setText(tQin, 'heat in: Qc');
    tQout.setAttribute('x', cool ? 504 : 16); tQout.setAttribute('y', 50); tQout.setAttribute('text-anchor', cool ? 'end' : 'start'); setText(tQout, 'heat out: Qh = Qc + W');
    tQin.setAttribute('class', 'hv-tag rc-tcold'); tQout.setAttribute('class', 'hv-tag rc-thot');
    var copAir = cop(t.cold, t.hot, !cool), copCoil = cop(t.evap, t.cond, !cool), html = '';
    if (t.hot <= t.cold) html += '<p class="hv-ok">' + (cool ? 'It’s cooler outside than inside.' : 'It’s warmer outside than inside.') + ' Heat would flow the way you want on its own: open a window!</p>';
    else {
      html += '<p>The lift: from ' + tf(t.cold) + ' up to ' + tf(t.hot) + '.</p>';
      html += '<p>Carnot limit on ' + (cool ? 'cooling' : 'heating') + ' COP for those air temperatures: <span class="big">' + fmtCop(copAir) + '</span></p>';
    }
    html += '<p>But the coils must run beyond the air: with a ' + gapS(t.gap) + ' gap, the evaporator boils at ' + tf(t.evap) + ' and the condenser condenses at ' + tf(t.cond) + ', so the limit falls to <b>' + fmtCop(copCoil) + '</b>.</p>';
    if (isFinite(copCoil)) {
      var qc = cool ? copCoil : copCoil - 1, qh = cool ? copCoil + 1 : copCoil;
      html += '<p class="hs-small">Per 1 kWh of electricity, an ideal machine with those coil temperatures would ' + (cool ? 'remove ' + qc.toFixed(1) + ' kWh of heat from the house and release ' + qh.toFixed(1) + ' kWh outdoors.' : 'gather ' + qc.toFixed(1) + ' kWh of heat outdoors and deliver ' + qh.toFixed(1) + ' kWh indoors.') + ' Real ' + (cool ? 'air conditioners reach COPs of about 2 to 6' : 'heat pumps reach COPs of about 2 to 4') + ' (OpenStax).</p>';
    }
    elOut.innerHTML = html;
    elSay.innerHTML = '<b>' + (st.stage + 1) + ' · ' + ['Compress', 'Condense', 'Expand', 'Evaporate'][st.stage] + '.</b> ' + texts(st.stage, t);
    chips.forEach(function (c, i) { c.classList.toggle('on', i === st.stage); });
    bPlay.textContent = st.play ? '❚❚ Pause' : '▶ Play';
    bPlay.setAttribute('aria-pressed', st.play ? 'true' : 'false');
  }
  function draw() {
    dots.forEach(function (o) {
      var L = locate(o.s + st.pos);
      o.el.setAttribute('cx', L.x.toFixed(1)); o.el.setAttribute('cy', L.y.toFixed(1));
      o.el.setAttribute('fill', colorAt(path[L.leg][1], L.f));
    });
    var tr = locate(st.pos);
    tracer.setAttribute('cx', tr.x.toFixed(1)); tracer.setAttribute('cy', tr.y.toFixed(1));
    var k = stageOf(tr.leg);
    if (k !== st.stage) { st.stage = k; update(); }
    var condG = st.mode === 'cool' ? gOut : gIn, evapG = st.mode === 'cool' ? gIn : gOut;
    gComp.classList.toggle('rc-act', k === 0); gExp.classList.toggle('rc-act', k === 2);
    condG.classList.toggle('rc-act', k === 1); evapG.classList.toggle('rc-act', k === 3);
  }
  var spin = 0, beat = 0;
  T.loop(root, function (dt) {
    if (!st.play) return;
    st.pos = (st.pos + dt * 0.05) % 1;
    spin = (spin + dt * 420) % 360; beat += dt;
    fIn.bl.setAttribute('transform', 'rotate(' + spin.toFixed(1) + ' ' + fIn.cx + ' ' + fIn.cy + ')');
    fOut.bl.setAttribute('transform', 'rotate(' + (-spin).toFixed(1) + ' ' + fOut.cx + ' ' + fOut.cy + ')');
    var sc = 1 + 0.06 * Math.max(0, Math.sin(beat * 9));
    compBody.setAttribute('transform', 'translate(310 338) scale(' + sc.toFixed(3) + ') translate(-310 -338)');
    draw();
  });
  function setMode(m) {
    st.mode = m;
    if (m === 'cool') { iIn.value = 75; iOut.value = 95; } else { iIn.value = 70; iOut.value = 30; }
    build(); st.pos = stageMid(st.stage); draw(); update();
  }
  function step(dir) {
    st.play = false;
    st.stage = (st.stage + dir + 4) % 4;
    st.pos = stageMid(st.stage); draw(); update();
  }
  q('.rc-mode').querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.v); }); });
  bPlay.addEventListener('click', function () { st.play = !st.play; update(); });
  q('.rc-next').addEventListener('click', function () { step(1); });
  q('.rc-prev').addEventListener('click', function () { step(-1); });
  [iIn, iOut, iGap].forEach(function (i) { i.addEventListener('input', update); });
  D.addEventListener('trb-units', update);
  build();
  setMode(startMode);
})(window, document);
