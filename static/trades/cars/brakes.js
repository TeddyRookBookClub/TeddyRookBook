/* Cars course, Lesson 8: brake hydraulics with Pascal's principle.
   F_master = F_foot × lever; P = F_master / A_master; F_wheel = P × A_wheel. Starting values reproduce the worked example in
   OpenStax College Physics 2e, section 11.5 (100 N foot force, 5:1 lever, 0.500 cm and 2.50 cm cylinders → 1.25 × 10⁴ N).
   1 lbf = 4.448222 N and 1 psi = 6.894757 kPa (NIST SP 811). No power booster is modeled. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-brakes');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, LBF = 4.448222, PSI = 6894.757;
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 440 300', role: 'img', 'aria-label': 'Brake pedal lever, master cylinder, brake line and wheel cylinder pressing a pad on a rotor', class: 'tr-brk' }, stage);
  svg.innerHTML = '<defs><marker id="brk-a" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="strokeWidth" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="b-arh"/></marker></defs>';
  // pedal: pivot at (60,40), pedal pad at (60,240); pushrod from (60,80) to master cylinder
  S('circle', { class: 'b-pivot', cx: 60, cy: 40, r: 7 }, svg);
  var lever = S('g', null, svg);
  S('path', { class: 'b-lever', d: 'M60,40 L60,232' }, lever);
  S('rect', { class: 'b-pad', x: 44, y: 232, width: 34, height: 12, rx: 4 }, lever);
  var foot = S('path', { class: 'b-force', d: 'M8,238 H40', 'marker-end': 'url(#brk-a)' }, svg);
  var tFoot = S('text', { class: 'b-t', x: 6, y: 226 }, svg);
  var rod = S('path', { class: 'b-rod', d: 'M60,80 H118' }, svg);
  // master cylinder body around y=80
  var mc = S('rect', { class: 'b-cyl', x: 118, y: 60, width: 70, height: 40, rx: 4 }, svg);
  var mcPiston = S('rect', { class: 'b-pist', x: 120, y: 70, width: 14, height: 20 }, svg);
  var mcFluid = S('rect', { class: 'b-fluid', x: 134, y: 70, width: 52, height: 20 }, svg);
  S('text', { class: 'b-t', x: 153, y: 54, 'text-anchor': 'middle' }, svg).textContent = 'master cylinder';
  // line
  var line = S('path', { class: 'b-line', d: 'M188,80 H250 V170 H290' }, svg);
  // gauge
  S('circle', { class: 'b-gauge', cx: 250, cy: 40, r: 24 }, svg);
  S('path', { class: 'b-line2', d: 'M250,64 V80' }, svg);
  var gNeedle = S('path', { class: 'b-needle', d: 'M250,40 L250,22' }, svg);
  var tP = S('text', { class: 'b-t b-tb', x: 280, y: 36 }, svg);
  S('text', { class: 'b-t', x: 280, y: 50 }, svg).textContent = 'same everywhere';
  // wheel cylinder / caliper with rotor
  var wc = S('rect', { class: 'b-cyl', x: 290, y: 120, width: 44, height: 100, rx: 4 }, svg);
  var wcFluid = S('rect', { class: 'b-fluid', x: 292, y: 140, width: 18, height: 60 }, svg);
  var wcPiston = S('rect', { class: 'b-pist', x: 310, y: 140, width: 18, height: 60 }, svg);
  var pad = S('rect', { class: 'b-padm', x: 334, y: 140, width: 10, height: 60, rx: 2 }, svg);
  S('rect', { class: 'b-rotor', x: 352, y: 100, width: 16, height: 150, rx: 3 }, svg);
  S('text', { class: 'b-t', x: 360, y: 92, 'text-anchor': 'middle' }, svg).textContent = 'rotor';
  S('text', { class: 'b-t', x: 312, y: 238, 'text-anchor': 'middle' }, svg).textContent = 'wheel piston';
  var out = S('path', { class: 'b-force', d: 'M300,100 H344', 'marker-end': 'url(#brk-a)' }, svg);
  var tOut = S('text', { class: 'b-t b-tb', x: 292, y: 92, 'text-anchor': 'end' }, svg);
  S('text', { class: 'b-t', x: 8, y: 290 }, svg).textContent = 'Drawing not to scale; piston sizes follow your settings.';

  side.innerHTML =
    '<label class="tr-field">Push on the pedal: <span class="v b-v1"></span><input type="range" class="b-foot" min="20" max="500" step="5" value="100" aria-label="Foot force in newtons"></label>' +
    '<label class="tr-field">Pedal lever ratio: <span class="v b-v2"></span><input type="range" class="b-lev" min="1" max="8" step="0.5" value="5" aria-label="Pedal lever ratio"></label>' +
    '<label class="tr-field">Master cylinder piston diameter: <span class="v b-v3"></span><input type="range" class="b-d1" min="0.3" max="3" step="0.05" value="0.5" aria-label="Master cylinder diameter in centimeters"></label>' +
    '<label class="tr-field">Wheel piston diameter: <span class="v b-v4"></span><input type="range" class="b-d2" min="1" max="7" step="0.05" value="2.5" aria-label="Wheel piston diameter in centimeters"></label>' +
    '<div class="tr-out b-out" aria-live="polite"></div>' +
    '<p class="tr-w-note"><button type="button" class="hs-btn ghost b-reset">Back to the OpenStax example</button></p>';
  var q = function (s) { return side.querySelector(s); };
  var iF = q('.b-foot'), iL = q('.b-lev'), i1 = q('.b-d1'), i2 = q('.b-d2'), elOut = q('.b-out');
  function f(x, d) { return T.fmt(x, d); }
  function sci(x) { if (x < 10000) return f(x, 0); var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e); return f(x, 0) + ' (' + m.toFixed(2) + ' × 10' + String(e).replace(/./g, function (c) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]; }) + ')'; }
  function update() {
    var F = +iF.value, Lr = +iL.value, d1 = +i1.value, d2 = +i2.value;
    var A1 = Math.PI * Math.pow(d1 / 100, 2) / 4, A2 = Math.PI * Math.pow(d2 / 100, 2) / 4;
    var Fm = F * Lr, P = Fm / A1, Fw = P * A2, mult = Fw / F, travel = 10 * A1 / (4 * A2); // mm per 1 cm of master travel, shared by 4 wheel pistons
    q('.b-v1').textContent = f(F, 0) + ' N (' + f(F / LBF, 1) + ' lb)';
    q('.b-v2').textContent = Lr + ' : 1';
    q('.b-v3').textContent = d1.toFixed(2) + ' cm';
    q('.b-v4').textContent = d2.toFixed(2) + ' cm';
    elOut.innerHTML =
      '<p>Force on the master piston: <b>' + f(Fm, 0) + ' N</b> (' + f(F, 0) + ' × ' + Lr + ')</p>' +
      '<p>Pressure in the fluid: <b>' + f(P / 1000, 0) + ' kPa</b> (' + f(P / PSI, 0) + ' psi)</p>' +
      '<p>Force from each wheel piston: <span class="big">' + sci(Fw) + ' N</span> (' + f(Fw / LBF, 0) + ' lb)</p>' +
      '<p>That’s <b>' + f(mult, 0) + ' times</b> your push, because the wheel piston has ' + f(A2 / A1, 1) + ' times the area of the master piston' + (Lr > 1 ? ', and the lever multiplies first' : '') + '.</p>' +
      '<p class="hs-small">The trade-off: if the master piston moves 1 cm, each of four wheel pistons this size moves only ' + (travel < 1 ? travel.toFixed(2) : travel.toFixed(1)) + ' mm.</p>';
    // drawing
    var h1 = Math.max(8, Math.min(36, d1 * 12)), h2 = Math.max(14, Math.min(96, d2 * 13.5));
    mc.setAttribute('y', 80 - h1 / 2 - 4); mc.setAttribute('height', h1 + 8);
    mcPiston.setAttribute('y', 80 - h1 / 2); mcPiston.setAttribute('height', h1);
    mcFluid.setAttribute('y', 80 - h1 / 2); mcFluid.setAttribute('height', h1);
    wc.setAttribute('y', 170 - h2 / 2 - 6); wc.setAttribute('height', h2 + 12);
    [wcFluid, wcPiston, pad].forEach(function (r) { r.setAttribute('y', 170 - h2 / 2); r.setAttribute('height', h2); });
    var lw = function (x) { return Math.max(2, Math.min(14, 2 + 2.2 * Math.log10(Math.max(1, x)))); };
    foot.setAttribute('stroke-width', lw(F)); out.setAttribute('stroke-width', lw(Fw));
    tFoot.textContent = f(F, 0) + ' N';
    tOut.textContent = 'pad force: ' + f(Fw, 0) + ' N';
    var yo = 170 - h2 / 2 - 18; out.setAttribute('d', 'M300,' + yo.toFixed(1) + ' H340'); tOut.setAttribute('y', (yo + 4).toFixed(1));
    var yr = 40 + 192 / Lr; rod.setAttribute('d', 'M62,' + yr.toFixed(1) + ' L118,80');
    var ang = Math.min(160, P / 1e6 * 20);   // gauge: 20° per MPa, capped
    gNeedle.setAttribute('transform', 'rotate(' + (-80 + ang).toFixed(1) + ' 250 40)');
    tP.textContent = f(P / PSI, 0) + ' psi';
    var push = Math.min(1, F / 500);
    lever.setAttribute('transform', 'rotate(' + (8 * push).toFixed(1) + ' 60 40)');
  }
  [iF, iL, i1, i2].forEach(function (i) { i.addEventListener('input', update); });
  q('.b-reset').addEventListener('click', function () { iF.value = 100; iL.value = 5; i1.value = 0.5; i2.value = 2.5; update(); });
  update();
})(window, document);
