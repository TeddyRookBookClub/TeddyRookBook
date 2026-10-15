/* Electrical course, Lesson 7: 3-way and 4-way switches. A 3-way switch connects its common terminal to one of two travelers;
   the light is on only when both 3-ways select the same traveler (University of Hawaiʻi Maui College 5.6; Purdue Extension 4-H).
   A 4-way switch between them passes the travelers straight through or crosses them over. Cable colors follow the
   three-conductor cable (black, red, white) that Purdue describes. Click a switch in the hallway or in the wiring diagram. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-switches');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { s1: 0, s2: 1, four: false, s3: 0, flips: 0 };   // 0 = up = red traveler (top), 1 = down = black traveler (bottom); s3: 0 straight, 1 crossed
  root.innerHTML = '';
  var stage = T.h('div', { class: 'tr-w-stage el-wide', style: '--el-mw:600px' }); root.appendChild(stage); root.insertBefore(T.h('p', { class: 'el-swipe', text: 'Swipe sideways to see the whole drawing.' }), stage);
  var svg = S('svg', { viewBox: '0 0 640 372', role: 'img', 'aria-label': 'A hallway with a ceiling light and a switch at each end, and below it the wiring diagram: power to the first switch, two traveler wires between the switches, and the second switch to the light', class: 'el-sw' }, stage);
  var defs = S('defs', null, svg);
  defs.innerHTML = '<radialGradient id="el-sw-g"><stop offset="0" stop-color="#fff3b0" stop-opacity=".95"/><stop offset=".6" stop-color="#ffd25a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>';
  function t(x, y, s, c, a) { var e = S('text', { class: c || 'el-sw-t', x: x, y: y, 'text-anchor': a || 'start' }, svg); e.textContent = s; return e; }
  // ----- hallway scene -----
  S('rect', { class: 'el-sw-hall', x: 10, y: 8, width: 620, height: 118, rx: 8 }, svg);
  S('path', { class: 'el-sw-floor', d: 'M10,112 H630' }, svg);
  var cone = S('path', { class: 'el-sw-cone', d: 'M300,26 L190,112 H450 L340,26 Z', opacity: 0 }, svg);
  var halo = S('circle', { cx: 320, cy: 26, r: 46, fill: 'url(#el-sw-g)', opacity: 0 }, svg);
  S('rect', { class: 'el-sw-fix', x: 300, y: 8, width: 40, height: 8, rx: 2 }, svg);
  var bulbScene = S('path', { class: 'el-sw-bulb', d: 'M304,16 a16,14 0 0 0 32,0 z' }, svg);
  t(18, 26, 'Hallway', 'el-sw-t el-sw-th');
  function plate(x, y, key, label) {
    var g = S('g', { class: 'el-sw-plate', tabindex: '0', role: 'button', 'data-k': key, 'aria-label': label }, svg);
    S('rect', { class: 'el-sw-pl', x: x - 13, y: y - 20, width: 26, height: 40, rx: 4 }, g);
    var tog = S('rect', { class: 'el-sw-tog', x: x - 4, y: y - 12, width: 8, height: 12, rx: 2 }, g);
    S('rect', { class: 'm-hit', x: x - 22, y: y - 28, width: 44, height: 56, fill: 'transparent' }, g);
    return { g: g, tog: tog, y: y };
  }
  var P1 = plate(52, 74, 's1', 'Left switch'), P2 = plate(588, 74, 's2', 'Right switch'), P3 = plate(470, 74, 's3', 'Middle switch (4-way)');
  // ----- wiring diagram -----
  t(18, 152, 'Wiring diagram', 'el-sw-t el-sw-th');
  S('rect', { class: 'el-sw-src', x: 12, y: 284, width: 52, height: 64, rx: 6 }, svg); t(38, 278, 'panel', 'el-sw-t', 'middle');
  t(38, 304, 'neutral', 'el-sw-tc', 'middle'); t(38, 338, 'hot', 'el-sw-tc', 'middle');
  function w(d, c, cls) { S('path', { class: 'el-edge', d: d, 'stroke-width': 5.6 }, svg); return S('path', { class: 'el-w' + c + (cls ? ' ' + cls : ''), d: d, 'stroke-width': 3.4 }, svg); }
  // fixed wires
  w('M64,334 H118 V262 H150', 'b');                // hot to S1 common
  w('M306,196 H90 V300 H64', 'w');                 // neutral from the light back
  w('M490,262 H566 V196 H334', 'b');               // S2 common to the light
  // travelers: red (top, y=232) and black (bottom, y=292)
  var trav3 = S('g', null, svg), trav4 = S('g', null, svg);
  (function () { var a = svg; svg = trav3; w('M190,232 H450', 'r'); w('M190,292 H450', 'b'); svg = a; })();
  (function () { var a = svg; svg = trav4; w('M190,232 H300', 'r'); w('M190,292 H300', 'b'); w('M340,232 H450', 'r'); w('M340,292 H450', 'b'); svg = a; })();
  // 4-way body and its internal links
  var g4 = S('g', { class: 'el-sw-sw', tabindex: '0', role: 'button', 'data-k': 's3', 'aria-label': 'Middle switch (4-way) in the diagram' }, trav4);
  S('rect', { class: 'el-sw-body', x: 290, y: 214, width: 60, height: 96, rx: 8 }, g4);
  var link4 = S('path', { class: 'el-sw-lever' }, g4);
  [[300, 232], [300, 292], [340, 232], [340, 292]].forEach(function (p) { S('circle', { class: 'el-sw-term b', cx: p[0], cy: p[1], r: 4.5 }, g4); });
  var lab4 = S('text', { class: 'el-sw-t', x: 320, y: 326, 'text-anchor': 'middle' }, g4);
  // 3-way switches
  function sw3(cx, cy, tx, key, label) {
    var g = S('g', { class: 'el-sw-sw', tabindex: '0', role: 'button', 'data-k': key, 'aria-label': label }, svg);
    S('rect', { class: 'el-sw-body', x: Math.min(cx, tx) - 14, y: 214, width: Math.abs(tx - cx) + 28, height: 96, rx: 8 }, g);
    var lever = S('path', { class: 'el-sw-lever' }, g);
    S('circle', { class: 'el-sw-term c', cx: cx, cy: cy, r: 5 }, g);
    S('circle', { class: 'el-sw-term b', cx: tx, cy: 232, r: 4.5 }, g); S('circle', { class: 'el-sw-term b', cx: tx, cy: 292, r: 4.5 }, g);
    return { lever: lever, cx: cx, cy: cy, tx: tx };
  }
  var S1 = sw3(150, 262, 190, 's1', 'Left switch in the diagram'), S2 = sw3(490, 262, 450, 's2', 'Right switch in the diagram');
  t(170, 206, '3-way', 'el-sw-t', 'middle'); t(470, 206, '3-way', 'el-sw-t', 'middle');
  t(150, 324, 'common', 'el-sw-tc', 'middle'); t(490, 324, 'common', 'el-sw-tc', 'middle');
  t(372, 226, 'traveler', 'el-sw-tc'); t(372, 306, 'traveler', 'el-sw-tc');
  // the light in the diagram
  var lampHalo = S('circle', { cx: 320, cy: 196, r: 28, fill: 'url(#el-sw-g)', opacity: 0 }, svg);
  var lamp = S('circle', { class: 'el-sw-lamp', cx: 320, cy: 196, r: 14 }, svg);
  S('path', { class: 'el-sw-x', d: 'M310,186 L330,206 M330,186 L310,206' }, svg);
  t(320, 174, 'light', 'el-sw-t', 'middle');
  // the live path overlay
  var live = S('path', { class: 'el-sw-live' }, svg);

  // ----- controls -----
  var ctrl = T.h('div', { class: 'tr-w-grid' }); root.appendChild(ctrl);
  var left = T.h('div'), right = T.h('div'); ctrl.appendChild(left); ctrl.appendChild(right);
  left.innerHTML = '<div class="tr-w-ctrl"><button type="button" class="hs-btn sw-b1">Flip the left switch</button><button type="button" class="hs-btn sw-b2">Flip the right switch</button><button type="button" class="hs-btn sw-b3" hidden>Flip the middle switch</button></div>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost sw-4" aria-pressed="false">Add a 4-way switch in the middle</button></div>' +
    '<div class="el-sw-table"></div>';
  right.innerHTML = '<div class="tr-out sw-out" aria-live="polite"></div>';
  var q = function (s) { return root.querySelector(s); };
  function flip(k) {
    if (k === 's3' && !st.four) return;
    st[k] = 1 - st[k]; st.flips++; draw();
  }
  q('.sw-b1').addEventListener('click', function () { flip('s1'); });
  q('.sw-b2').addEventListener('click', function () { flip('s2'); });
  q('.sw-b3').addEventListener('click', function () { flip('s3'); });
  var b4 = q('.sw-4');
  b4.addEventListener('click', function () { st.four = !st.four; b4.setAttribute('aria-pressed', st.four); draw(); });
  svg.querySelectorAll('[data-k]').forEach(function (g) {
    g.addEventListener('click', function () { flip(g.dataset.k); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(g.dataset.k); } });
  });
  var TY = [232, 292];
  function draw() {
    var p1 = st.s1, cross = st.four && st.s3 === 1, mid = cross ? 1 - p1 : p1, on = mid === st.s2;
    S1.lever.setAttribute('d', 'M' + S1.cx + ',' + S1.cy + ' L' + S1.tx + ',' + TY[st.s1]);
    S2.lever.setAttribute('d', 'M' + S2.cx + ',' + S2.cy + ' L' + S2.tx + ',' + TY[st.s2]);
    link4.setAttribute('d', cross ? 'M300,232 L340,292 M300,292 L340,232' : 'M300,232 H340 M300,292 H340');
    lab4.textContent = cross ? '4-way: crossed' : '4-way: straight';
    trav3.style.display = st.four ? 'none' : ''; trav4.style.display = st.four ? '' : 'none';
    P3.g.style.display = st.four ? '' : 'none'; q('.sw-b3').hidden = !st.four;
    // scene toggles: up = red traveler, down = black traveler (for the 4-way: up = straight)
    [[P1, st.s1], [P2, st.s2], [P3, st.s3]].forEach(function (p) { p[0].tog.setAttribute('y', p[1] ? p[0].y : p[0].y - 12); });
    // live path: from the source along the selected traveler
    var d = 'M64,334 H118 V262 H150 L190,' + TY[p1];
    if (st.four) d += ' H300 L340,' + TY[mid] + ' H450'; else d += ' H450';
    if (on) d += ' L490,262 H566 V196 H334 M306,196 H90 V300 H64';
    live.setAttribute('d', d);
    live.setAttribute('class', 'el-sw-live' + (on ? ' on' : ''));
    lamp.setAttribute('class', 'el-sw-lamp' + (on ? ' on' : ''));
    bulbScene.setAttribute('class', 'el-sw-bulb' + (on ? ' on' : ''));
    [cone, halo, lampHalo].forEach(function (e) { e.style.opacity = on ? (e === cone ? 0.2 : 1) : 0; });
    var names = ['red (top)', 'black (bottom)'];
    q('.sw-out').innerHTML = '<p>The light is <span class="big">' + (on ? 'ON' : 'OFF') + '</span></p>' +
      '<p>Left switch connects power to the <b>' + names[p1] + '</b> traveler.' + (st.four ? ' The 4-way passes it <b>' + (cross ? 'crossed over' : 'straight through') + '</b>, onto the ' + names[mid] + ' traveler.' : '') + '</p>' +
      '<p>Right switch is set to the <b>' + names[st.s2] + '</b> traveler. ' + (on ? 'They match, so the path to the light is complete.' : 'They don’t match: the live traveler stops at an open terminal.') + '</p>' +
      '<p class="hs-small">Flips so far: ' + st.flips + '. Flip any one switch and the light changes, no matter how the others are set.</p>';
    // truth table
    var rows = '', combos = st.four ? [[0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 0, 0], [1, 0, 1], [1, 1, 0], [1, 1, 1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    combos.forEach(function (c) {
      var m = st.four ? (c[1] ? 1 - c[0] : c[0]) : c[0], last = st.four ? c[2] : c[1], lit = m === last;
      var cur = c[0] === st.s1 && (st.four ? c[1] === st.s3 && c[2] === st.s2 : c[1] === st.s2);
      rows += '<tr' + (cur ? ' class="cur"' : '') + '><td>' + (c[0] ? 'down' : 'up') + '</td>' + (st.four ? '<td>' + (c[1] ? 'crossed' : 'straight') + '</td>' : '') + '<td>' + (last ? 'down' : 'up') + '</td><td>' + (lit ? '💡 on' : 'off') + '</td></tr>';
    });
    q('.el-sw-table').innerHTML = '<table class="hs-table el-sw-tt"><caption>Every combination</caption><thead><tr><th scope="col">Left</th>' + (st.four ? '<th scope="col">Middle</th>' : '') + '<th scope="col">Right</th><th scope="col">Light</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
  var off = 0;
  if (!T.reduced) T.loop(svg, function (dt) { off = (off - dt * 40) % 1000; live.style.strokeDashoffset = off.toFixed(1); });
  draw();
})(window, document);
