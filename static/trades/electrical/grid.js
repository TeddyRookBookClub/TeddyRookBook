/* Electrical course, Lesson 1: from the power plant to the house, and why transmission runs at high voltage.
   Simple model: the current in the transmission line is I = P / V (power sent ÷ line voltage), and the line wastes
   P_loss = I² × R as heat. Starting values reproduce OpenStax College Physics 2e, Example 20.10 (100 MW at 200 kV through 1 Ω:
   500 A and 250 kW lost, 0.25 %; at 25 kV: 4,000 A and 16 MW, 16 %). Voltage stages from OpenStax 23.7. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-grid');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  root.innerHTML = '';
  var stage = T.h('div', { class: 'tr-w-stage el-wide', style: '--el-mw:620px' }); root.appendChild(stage); root.insertBefore(T.h('p', { class: 'el-swipe', text: 'Swipe sideways to see the whole drawing.' }), stage);
  var svg = S('svg', { viewBox: '0 0 720 250', role: 'img', 'aria-label': 'Animated power grid: a power plant, a step-up transformer, transmission towers, a substation, distribution poles, a pole transformer and a house. The transmission line glows hotter as more power is lost.', class: 'el-grid' }, stage);
  var g = S('g', null, svg);
  var GY = 222;
  S('path', { class: 'el-g-ground', d: 'M0,' + GY + ' H720' }, g);
  // power plant
  S('rect', { class: 'el-g-bld', x: 8, y: 150, width: 70, height: 72, rx: 3 }, g);
  S('rect', { class: 'el-g-bld', x: 52, y: 96, width: 14, height: 56 }, g);
  var steam = S('path', { class: 'el-g-steam', d: 'M59,90 q-8,-10 2,-20 q10,-10 0,-22' }, g);
  S('circle', { class: 'el-g-gen', cx: 30, cy: 188, r: 14 }, g);
  S('text', { class: 'tx-w tx-b', x: 30, y: 193, 'text-anchor': 'middle' }, g).textContent = 'G';
  // step-up transformer
  S('rect', { class: 'el-g-xf', x: 90, y: 178, width: 30, height: 44, rx: 4 }, g);
  S('path', { class: 'el-g-fin', d: 'M95,184 v32 M101,184 v32 M107,184 v32 M113,184 v32' }, g);
  // towers
  function tower(x) {
    S('path', { class: 'el-g-tower', d: 'M' + (x - 14) + ',' + GY + ' L' + x + ',58 L' + (x + 14) + ',' + GY + ' M' + (x - 20) + ',70 H' + (x + 20) + ' M' + (x - 10) + ',130 L' + (x + 10) + ',170 M' + (x + 10) + ',130 L' + (x - 10) + ',170 M' + (x - 6) + ',100 L' + (x + 7) + ',128 M' + (x + 6) + ',100 L' + (x - 7) + ',128' }, g);
  }
  [180, 300, 420].forEach(tower);
  // substation
  S('rect', { class: 'el-g-fence', x: 470, y: 176, width: 62, height: 46 }, g);
  S('rect', { class: 'el-g-xf', x: 484, y: 184, width: 34, height: 38, rx: 4 }, g);
  S('path', { class: 'el-g-fin', d: 'M490,190 v26 M497,190 v26 M504,190 v26 M511,190 v26' }, g);
  // distribution poles and the pole transformer
  [570, 630].forEach(function (x) { S('path', { class: 'el-g-pole', d: 'M' + x + ',' + GY + ' V120 M' + (x - 12) + ',124 H' + (x + 12) }, g); });
  S('rect', { class: 'el-g-xf', x: 634, y: 132, width: 12, height: 22, rx: 3 }, g);
  // house
  S('path', { class: 'el-g-house', d: 'M664,' + GY + ' V176 L690,152 L716,176 V' + GY + ' Z' }, g);
  var win = S('rect', { class: 'el-g-win', x: 682, y: 184, width: 16, height: 14, rx: 2 }, g);
  // lines
  var LT = 'M120,186 C140,180 160,66 180,70 Q240,96 300,70 Q360,96 420,70 C440,66 470,150 486,184';
  var LD = 'M518,190 C540,170 556,126 570,124 Q600,140 630,124 C636,126 638,130 640,132';
  var LS = 'M646,150 Q660,160 676,176';
  var lineBg = S('path', { class: 'el-g-line', d: LT }, g);
  var lineHot = S('path', { class: 'el-g-hot', d: LT, 'stroke-opacity': 0 }, g);
  S('path', { class: 'el-g-line2', d: LD }, g);
  S('path', { class: 'el-g-line3', d: LS }, g);
  function lab(x, y, s, c, a) { var t = S('text', { class: c || 'tx-sm', x: x, y: y, 'text-anchor': a || 'middle' }, g); t.textContent = s; return t; }
  lab(43, 244, 'power plant'); lab(105, 172, 'step up', 'tx-sm tx-hot');
  var vLab = lab(300, 46, '', 'tx-ink tx-b');
  lab(501, 244, 'substation: step down', 'tx-sm tx-cool');
  lab(600, 110, '5 to 13 kV'); lab(716, 244, '120/240 V', 'tx-sm', 'end');
  // moving charges
  var lenT = lineBg.getTotalLength ? lineBg.getTotalLength() : 420;
  var pathD = S('path', { d: LD, fill: 'none', stroke: 'none' }, g), lenD = pathD.getTotalLength ? pathD.getTotalLength() : 140;
  var dots = [], dotsD = [], i;
  for (i = 0; i < 26; i++) dots.push({ el: S('circle', { class: 'el-g-dot', r: 2.6 }, g), t: i / 26 });
  for (i = 0; i < 8; i++) dotsD.push({ el: S('circle', { class: 'el-g-dot2', r: 2 }, g), t: i / 8 });

  // controls
  var ctrl = T.h('div', { class: 'tr-w-grid el-g-ctrl' }); root.appendChild(ctrl);
  var left = T.h('div'), right = T.h('div'); ctrl.appendChild(left); ctrl.appendChild(right);
  left.innerHTML =
    '<label class="tr-field">Transmission voltage: <span class="v g-vv"></span><input type="range" class="g-v" min="0" max="1000" step="1" aria-label="Transmission voltage, 25 to 700 kilovolts"></label>' +
    '<label class="tr-field">Power sent: <span class="v g-pv"></span><input type="range" class="g-p" min="10" max="500" step="10" value="100" aria-label="Power sent in megawatts"></label>' +
    '<label class="tr-field">Resistance of the line: <span class="v g-rv"></span><input type="range" class="g-r" min="0.5" max="3" step="0.1" value="1" aria-label="Line resistance in ohms"></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost g-a">OpenStax: 200 kV</button><button type="button" class="hs-btn ghost g-b">Same power at 25 kV</button><button type="button" class="hs-btn ghost g-c">700 kV</button></div>';
  right.innerHTML = '<div class="tr-out g-out" aria-live="polite"></div>';
  var q = function (s) { return root.querySelector(s); };
  var iV = q('.g-v'), iP = q('.g-p'), iR = q('.g-r'), out = q('.g-out');
  var VMIN = 25, VMAX = 700;
  function vFromSlider() { return VMIN * Math.pow(VMAX / VMIN, +iV.value / 1000); }
  function sliderFromV(v) { return Math.round(1000 * Math.log(v / VMIN) / Math.log(VMAX / VMIN)); }
  iV.value = sliderFromV(200);
  var cur = { I: 500, frac: 0.0025 };
  function f(x, d) { return T.fmt(x, d); }
  function power(w) { return w >= 1e6 ? f(w / 1e6, w >= 1e7 ? 0 : 1) + ' MW' : f(w / 1e3, 0) + ' kW'; }
  function kvTxt(kv) { return f(kv, kv < 100 ? 1 : 0) + ' kV'; }
  function update() {
    var kv = vFromSlider();
    [25, 200, 700].forEach(function (s) { if (Math.abs(kv - s) / s < 0.008) kv = s; });
    var P = +iP.value * 1e6, R = +iR.value, V = kv * 1000, I = P / V, loss = I * I * R, frac = loss / P;
    cur.I = I; cur.frac = frac;
    q('.g-vv').textContent = kvTxt(kv) + ' (' + f(V, 0) + ' volts)';
    q('.g-pv').textContent = f(P / 1e6, 0) + ' MW';
    q('.g-rv').textContent = R.toFixed(1) + ' Ω';
    iV.setAttribute('aria-valuetext', kvTxt(kv));
    vLab.textContent = kvTxt(kv) + ', ' + f(I, 0) + ' A';
    var pct = frac * 100;
    var html = '<p>Current in the line: <span class="big">' + f(I, 0) + ' A</span> <small>(' + f(P / 1e6, 0) + ' MW ÷ ' + kvTxt(kv) + ')</small></p>' +
      '<p>Heat lost in the line: <b>' + power(Math.min(loss, 9.99e9)) + '</b> <small>(' + f(I, 0) + '² × ' + R.toFixed(1) + ' Ω)</small></p>';
    if (frac >= 1) {
      html += '<p class="warn">The model breaks down: at this voltage the line would waste more power than you’re sending. That’s why long lines never run at low voltage.</p>';
    } else {
      html += '<p>That’s <b class="' + (pct > 5 ? 'warn' : 'ok') + '">' + (pct < 1 ? pct.toFixed(2) : pct.toFixed(1)) + ' percent</b> of the power sent.</p>';
    }
    html += '<div class="el-g-bar" aria-hidden="true"><b style="width:' + Math.max(0.4, Math.min(100, pct)).toFixed(2) + '%"></b></div><p class="hs-small">Red is the share lost as heat. Double the voltage and the current halves, so the loss drops to a quarter.</p>';
    out.innerHTML = html;
    lineHot.setAttribute('stroke-opacity', Math.min(1, frac * 6).toFixed(2));
    lineHot.setAttribute('stroke-width', (2.5 + Math.min(6, frac * 30)).toFixed(1));
    win.setAttribute('class', 'el-g-win' + (frac < 1 ? ' on' : ''));
    if (T.reduced) frame(0);
  }
  [iV, iP, iR].forEach(function (x) { x.addEventListener('input', update); });
  q('.g-a').addEventListener('click', function () { iV.value = sliderFromV(200); iP.value = 100; iR.value = 1; update(); });
  q('.g-b').addEventListener('click', function () { iV.value = sliderFromV(25); iP.value = 100; iR.value = 1; update(); });
  q('.g-c').addEventListener('click', function () { iV.value = 1000; update(); });

  function place(list, path, len, dt, speed) {
    list.forEach(function (d) {
      d.t = (d.t + dt * speed / len) % 1;
      var pt = path.getPointAtLength ? path.getPointAtLength(d.t * len) : { x: 0, y: 0 };
      d.el.setAttribute('cx', pt.x.toFixed(1)); d.el.setAttribute('cy', pt.y.toFixed(1));
    });
  }
  var st = 0;
  function frame(dt) {
    // the dots stand for the current: faster for more amps (log scale keeps the whole range visible)
    var sp = 20 + 26 * Math.log10(Math.max(10, cur.I));
    place(dots, lineBg, lenT, dt, sp);
    place(dotsD, pathD, lenD, dt, 40);
    st += dt;
    steam.setAttribute('opacity', (0.45 + 0.25 * Math.sin(st * 2)).toFixed(2));
  }
  update();
  frame(0);
  if (!T.reduced) T.loop(svg, frame);
})(window, document);
