/* Electrical course, Lesson 4: the kitchen circuit game. Each appliance draws I = P / 120 V; the currents on a circuit add up.
   Each breaker uses the same teaching model as Lesson 3 (bimetal heat dh/dt = (x² − h)/τ, τ = 150 s, trip at h = 1.05²,
   magnetic trip at 10× the rating), with game time running 30 times faster than real time.
   Wattages are typical label values inside the ranges listed by Virginia Cooperative Extension (BSE-301NP), plus DOE's
   1,500 W kettle and 9 W LED. OSHA's workplace rule (29 CFR 1910.304, Table S-4) caps one cord-and-plug load at 80 % of the receptacle rating. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-load');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var TAU = 150, HT = 1.05 * 1.05, GAME = 30, V = 120;
  var AP = [
    { k: 'kettle', n: 'Electric kettle', s: 'Kettle', w: 1500, c: 0, on: true },
    { k: 'toaster', n: 'Toaster', s: 'Toaster', w: 1100, c: 0, on: false },
    { k: 'coffee', n: 'Coffee maker', s: 'Coffee', w: 1000, c: 0, on: false },
    { k: 'micro', n: 'Microwave oven', s: 'Microwave', w: 1000, c: 1, on: false },
    { k: 'oven', n: 'Toaster oven', s: 'Toast oven', w: 1225, c: 1, on: false },
    { k: 'heater', n: 'Space heater', s: 'Heater', w: 1500, c: 1, on: false },
    { k: 'laptop', n: 'Laptop', s: 'Laptop', w: 50, c: 1, on: false },
    { k: 'lamp', n: 'LED lamp', s: 'Lamp', w: 9, c: 0, on: true }
  ];
  var CIR = [{ name: 'A', rating: 20, h: 0, closed: true, how: '' }, { name: 'B', rating: 20, h: 0, closed: true, how: '' }];
  root.innerHTML = '';
  var stage = T.h('div', { class: 'tr-w-stage el-wide', style: '--el-mw:600px' }); root.appendChild(stage); root.insertBefore(T.h('p', { class: 'el-swipe', text: 'Swipe sideways to see the whole drawing.' }), stage);
  var svg = S('svg', { viewBox: '0 0 640 262', role: 'img', 'aria-label': 'A kitchen counter with two 120-volt circuits, A and B, each with an ammeter and a breaker in the panel', class: 'el-load' }, stage);
  // panel
  S('rect', { class: 'el-l-panel', x: 8, y: 58, width: 64, height: 128, rx: 6 }, svg);
  S('text', { class: 'el-l-t', x: 40, y: 52, 'text-anchor': 'middle' }, svg).textContent = 'Panel';
  var brk = [], wires = [], wiresHot = [], meters = [], zoneG = [], zoneDim = [], tripTxt = [];
  var ZX = [96, 372], ZW = 264;
  [0, 1].forEach(function (c) {
    var y = 76 + c * 54;
    brk[c] = { body: S('rect', { class: 'el-l-brk', x: 20, y: y, width: 40, height: 30, rx: 4 }, svg), lab: S('text', { class: 'el-l-bt', x: 40, y: y + 20, 'text-anchor': 'middle' }, svg) };
    var x0 = ZX[c] + ZW / 2;
    var d = 'M60,' + (y + 15) + ' H' + (80 + c * 6) + ' V' + (236 - c * 4) + ' H' + x0 + ' V214';
    wires[c] = S('path', { class: 'el-l-wire c' + c, d: d }, svg);
    wiresHot[c] = S('path', { class: 'el-l-hot', d: d, 'stroke-opacity': 0 }, svg);
    // zone
    S('rect', { class: 'el-l-zone c' + c, x: ZX[c], y: 68, width: ZW, height: 132, rx: 10 }, svg);
    S('rect', { class: 'el-l-outlet', x: x0 - 9, y: 204, width: 18, height: 22, rx: 4 }, svg);
    S('text', { class: 'el-l-t', x: x0 + 14, y: 220 }, svg).textContent = 'Circuit ' + CIR[c].name;
    zoneG[c] = S('g', null, svg);
    zoneDim[c] = S('rect', { class: 'el-l-dim', x: ZX[c], y: 68, width: ZW, height: 132, rx: 10, opacity: 0 }, svg);
    tripTxt[c] = S('text', { class: 'el-l-trip', x: x0, y: 140, 'text-anchor': 'middle', opacity: 0 }, svg); tripTxt[c].textContent = 'TRIPPED';
    // ammeter
    var mx = ZX[c] + 8, mw = ZW - 16;
    S('rect', { class: 'el-l-mbg', x: mx, y: 10, width: mw, height: 16, rx: 8 }, svg);
    var fill = S('rect', { class: 'el-l-mfill', x: mx, y: 10, width: 0, height: 16, rx: 8 }, svg);
    var r80 = S('path', { class: 'el-l-m80', d: '' }, svg), r100 = S('path', { class: 'el-l-m100', d: '' }, svg);
    var txt = S('text', { class: 'el-l-mt', x: mx, y: 44 }, svg);
    meters[c] = { fill: fill, r80: r80, r100: r100, txt: txt, x: mx, w: mw };
  });
  S('rect', { class: 'el-l-counter', x: 88, y: 200, width: 552, height: 10, rx: 3 }, svg);

  // controls
  var ctrl = T.h('div', { class: 'el-l-cards' }); root.appendChild(ctrl);
  AP.forEach(function (a, i) {
    var card = T.h('div', { class: 'el-l-card' });
    card.innerHTML = '<p><b>' + a.n + '</b><small>' + T.fmt(a.w, 0) + ' W · ' + T.fmt(a.w / V, 1) + ' A</small></p>' +
      '<div class="el-l-row"><button type="button" class="el-l-on" aria-pressed="' + a.on + '" aria-label="' + a.n + ' on or off">' + (a.on ? 'On' : 'Off') + '</button>' +
      '<span class="tr-seg" role="group" aria-label="' + a.n + ': which circuit"><button type="button" data-c="0" aria-pressed="' + (a.c === 0) + '">A</button><button type="button" data-c="1" aria-pressed="' + (a.c === 1) + '">B</button></span></div>';
    ctrl.appendChild(card);
    var onB = card.querySelector('.el-l-on');
    onB.addEventListener('click', function () { a.on = !a.on; onB.setAttribute('aria-pressed', a.on); onB.textContent = a.on ? 'On' : 'Off'; update(); });
    card.querySelectorAll('[data-c]').forEach(function (b) {
      b.addEventListener('click', function () {
        a.c = +b.dataset.c; card.querySelectorAll('[data-c]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); update();
      });
    });
    a.card = card;
  });
  var bottom = T.h('div', { class: 'tr-w-grid el-l-bottom' }); root.appendChild(bottom);
  var bl = T.h('div'), br = T.h('div'); bottom.appendChild(bl); bottom.appendChild(br);
  bl.innerHTML = [0, 1].map(function (c) {
    return '<div class="tr-w-ctrl"><b>Breaker ' + CIR[c].name + ':</b><span class="tr-seg" role="group" aria-label="Breaker ' + CIR[c].name + ' rating"><button type="button" data-r="15" data-k="' + c + '" aria-pressed="false">15 A</button><button type="button" data-r="20" data-k="' + c + '" aria-pressed="true">20 A</button></span>' +
      '<button type="button" class="hs-btn ghost el-l-reset" data-k="' + c + '">Reset ' + CIR[c].name + '</button></div>';
  }).join('') + '<p class="hs-small">On each meter, the gold dashed line marks 80% of the rating and the black line marks the rating.</p><p class="hs-small">Goal: run the <b>kettle, toaster and coffee maker</b> at the same time without tripping a breaker. Game time runs 30 times faster than real time.</p>';
  br.innerHTML = '<div class="tr-out el-l-out" aria-live="polite"></div>';
  var out = br.querySelector('.el-l-out');
  bl.querySelectorAll('[data-r]').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = +b.dataset.k; CIR[c].rating = +b.dataset.r;
      bl.querySelectorAll('[data-r][data-k="' + c + '"]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      update();
    });
  });
  var msg = ['', ''];
  bl.querySelectorAll('.el-l-reset').forEach(function (b) {
    b.addEventListener('click', function () {
      var c = +b.dataset.k, k = CIR[c];
      if (k.closed) msg[c] = 'Breaker ' + k.name + ' is already on.';
      else if (k.h >= HT) msg[c] = 'Breaker ' + k.name + ' is still too hot to reset. Turn something off and wait a moment.';
      else { k.closed = true; k.how = ''; msg[c] = 'Breaker ' + k.name + ' reset.'; }
      update();
    });
  });
  function amps(c) { var s = 0; AP.forEach(function (a) { if (a.on && a.c === c) s += a.w / V; }); return s; }
  function f(x, d) { return T.fmt(x, d); }
  function secs(s) { return s < 60 ? f(s, 0) + ' s' : f(s / 60, 1) + ' min'; }
  function drawZone(c) {
    var g = zoneG[c]; while (g.firstChild) g.removeChild(g.firstChild);
    var items = AP.filter(function (a) { return a.c === c; });
    var n = items.length, cols = Math.min(3, Math.max(1, n)), cw = (ZW - 16) / 3;
    items.forEach(function (a, i) {
      var col = i % 3, row = Math.floor(i / 3), x = ZX[c] + 8 + col * cw + cw / 2 + (3 - Math.min(3, n)) * cw / 2, y = 98 + row * 40;
      var live = a.on && CIR[c].closed;
      S('rect', { class: 'el-l-app' + (live ? ' on' : ''), x: x - 38, y: y - 20, width: 76, height: 31, rx: 7 }, g);
      var t = S('text', { class: 'el-l-at', x: x, y: y - 5, 'text-anchor': 'middle' }, g); t.textContent = a.s;
      var t2 = S('text', { class: 'el-l-aw', x: x, y: y + 8, 'text-anchor': 'middle' }, g); t2.textContent = a.on ? f(a.w / V, 1) + ' A' : 'off';
      S('path', { class: 'el-l-cord' + (a.on ? ' on' : ''), d: 'M' + x + ',' + (y + 11) + ' Q' + x + ',' + 196 + ' ' + (ZX[c] + ZW / 2) + ',206' }, g);
    });
  }
  function update() {
    var lines = [];
    [0, 1].forEach(function (c) {
      var k = CIR[c], I = k.closed ? amps(c) : 0, x = I / k.rating, m = meters[c], scale = 30;
      var lb = brk[c];
      lb.body.setAttribute('class', 'el-l-brk' + (k.closed ? '' : ' trip'));
      lb.lab.textContent = k.closed ? k.rating + ' A' : 'OFF';
      var wFill = Math.min(1, I / scale) * m.w;
      m.fill.setAttribute('width', wFill.toFixed(1));
      m.fill.setAttribute('class', 'el-l-mfill ' + (x > 1 ? 'over' : x > 0.8 ? 'warn' : 'ok'));
      var x80 = m.x + 0.8 * k.rating / scale * m.w, x100 = m.x + k.rating / scale * m.w;
      m.r80.setAttribute('d', 'M' + x80.toFixed(1) + ',6 v24'); m.r100.setAttribute('d', 'M' + x100.toFixed(1) + ',4 v28');
      m.txt.textContent = k.closed ? f(I, 1) + ' A of ' + k.rating + ' A (' + f(100 * x, 0) + '%)' : 'Tripped: 0 A';
      wiresHot[c].setAttribute('stroke-opacity', k.closed ? Math.min(1, Math.max(0, x - 0.7) * 2).toFixed(2) : 0);
      zoneDim[c].setAttribute('opacity', k.closed ? 0 : 0.55); tripTxt[c].setAttribute('opacity', k.closed ? 0 : 1);
      drawZone(c);
      var heat = Math.min(999, 100 * k.h / HT);
      var line = '<b>Circuit ' + k.name + '</b>: ';
      if (!k.closed) line += '<span class="warn">tripped (' + k.how + ')</span>. Turn something off or move it to the other circuit, then reset.';
      else if (I === 0) line += 'nothing running.';
      else {
        line += f(I, 1) + ' A on a ' + k.rating + '-A breaker, ' + f(100 * x, 0) + '%. ';
        if (x >= 10) line += '<span class="warn">Short circuit!</span>';
        else if (x * x > HT) { var rem = -TAU * Math.log((x * x - HT) / (x * x - Math.min(k.h, HT * 0.9999))); line += '<span class="warn">Overloaded: trips in about ' + secs(rem) + ' of game time.</span>'; }
        else if (x > 1) line += '<span class="warn">Just over the rating: the bimetal is warming.</span>';
        else if (x > 0.8) line += '<span>Over 80% of the rating: the breaker holds, but OSHA’s workplace rule limits any single plug-in load to 80%.</span>';
        else line += '<span class="ok">OK.</span>';
        if (heat > 1) line += ' <small>Bimetal heat ' + f(heat, 0) + '% of trip.</small>';
      }
      if (msg[c]) line += ' <small>' + msg[c] + '</small>';
      lines.push('<p>' + line + '</p>');
    });
    var goal = ['kettle', 'toaster', 'coffee'].every(function (k) { var a = AP.filter(function (z) { return z.k === k; })[0]; return a.on && CIR[a.c].closed; }) &&
      [0, 1].every(function (c) { return amps(c) <= CIR[c].rating; });
    lines.push(goal ? '<p class="ok">✓ Breakfast is served: all three are running and neither circuit is over its rating.</p>' :
      '<p class="hs-small">Total running: ' + f(amps(0) + amps(1), 1) + ' A. Remember: amps = watts ÷ 120.</p>');
    out.innerHTML = lines.join('');
  }
  var acc = 0;
  T.loop(svg, function (dt) {
    var changed = false;
    [0, 1].forEach(function (c) {
      var k = CIR[c], I = k.closed ? amps(c) : 0, x = I / k.rating, sdt = dt * GAME;
      k.h = x * x + (k.h - x * x) * Math.exp(-sdt / TAU);
      if (k.closed && (x >= 10 || k.h >= HT)) { k.closed = false; k.how = x >= 10 ? 'magnetic' : 'thermal'; msg[c] = ''; changed = true; }
    });
    acc += dt;
    if (changed || acc > 0.25) { acc = 0; update(); }
  });
  update();
})(window, document);
