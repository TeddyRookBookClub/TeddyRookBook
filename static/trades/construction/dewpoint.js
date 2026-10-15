/* Construction course, Lesson 10: when does a cold surface sweat? Air at a given temperature and relative humidity
   holds a fixed amount of water vapor. Cool it without adding or removing water and it reaches 100% humidity at its
   dew point; any surface colder than that collects condensation. Saturation vapor density of water from OpenStax
   College Physics 2e, Table 13.5 (−20 to 40 °C), interpolated on a log scale. Relative humidity = vapor density ÷
   saturation vapor density. The scenarios set example temperatures only; type in your own. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-dewpoint');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var SAT = [[-20, 0.89], [-10, 2.36], [0, 4.84], [5, 6.80], [10, 9.40], [15, 12.8], [20, 17.2], [25, 23.0], [30, 30.4], [37, 44.0], [40, 51.1]];
  function sat(c) { if (c <= SAT[0][0]) return SAT[0][1]; for (var i = 1; i < SAT.length; i++) if (c <= SAT[i][0]) { var a = SAT[i - 1], b = SAT[i], f = (c - a[0]) / (b[0] - a[0]); return Math.exp(Math.log(a[1]) + f * (Math.log(b[1]) - Math.log(a[1]))); } return SAT[SAT.length - 1][1]; }
  function dewC(c, rh) { var v = sat(c) * rh, lo = -25, hi = c; for (var k = 0; k < 40; k++) { var m = (lo + hi) / 2; if (sat(m) > v) hi = m; else lo = m; } return (lo + hi) / 2; }
  var F2C = function (f) { return (f - 32) * 5 / 9; }, C2F = function (c) { return c * 9 / 5 + 32; };
  var SC = [
    ['Window on a cold night', 70, 40, 30, 'window'],
    ['Basement wall in summer', 80, 65, 62, 'wall'],
    ['Cold-water pipe', 75, 60, 55, 'pipe'],
    ['Bathroom after a shower', 74, 90, 66, 'mirror']
  ];
  var st = { air: 70, rh: 40, surf: 30, kind: 'window', fog: 0 };
  root.innerHTML = '';
  root.classList.add('cn-dp');
  var pick = T.h('div', { class: 'tr-seg cn-dp-sc', role: 'group', 'aria-label': 'Scenario' });
  SC.forEach(function (s, i) { pick.appendChild(T.h('button', { type: 'button', 'data-i': i, 'aria-pressed': i === 0 ? 'true' : 'false', text: s[0] })); });
  root.appendChild(pick);
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var left = T.h('div'); grid.appendChild(left);
  var stage = T.h('div', { class: 'tr-w-stage' }); left.appendChild(stage);
  // chart: x = temperature 0–100 °F, y = water vapor in the air (g/m³)
  var svg = S('svg', { viewBox: '0 0 520 320', role: 'img', 'aria-label': 'Chart of how much water vapor air can hold at each temperature, with the room air, its dew point and the cold surface marked' }, stage);
  var X0 = 56, X1 = 500, Y0 = 280, Y1 = 30, FMIN = 0, FMAX = 100, VMAX = 40;
  var xF = function (f) { return X0 + (f - FMIN) / (FMAX - FMIN) * (X1 - X0); }, yV = function (v) { return Y0 - v / VMAX * (Y0 - Y1); };
  var axes = '';
  for (var f = 0; f <= 100; f += 20) axes += 'M' + xF(f) + ',' + Y0 + ' v5 ';
  for (var v = 0; v <= 40; v += 10) axes += 'M' + X0 + ',' + yV(v) + ' h-5 ';
  S('path', { class: 'cn-dp-grid', d: (function () { var d = ''; for (var f = 20; f <= 100; f += 20) d += 'M' + xF(f) + ',' + Y0 + ' V' + Y1 + ' '; for (var v = 10; v <= 40; v += 10) d += 'M' + X0 + ',' + yV(v) + ' H' + X1 + ' '; return d; })() }, svg);
  S('path', { class: 'cn-dp-axis', d: 'M' + X0 + ',' + Y1 + ' V' + Y0 + ' H' + X1 + ' ' + axes }, svg);
  for (var f2 = 0; f2 <= 100; f2 += 20) { var t = S('text', { class: 'tx-sm', x: xF(f2), y: Y0 + 18, 'text-anchor': 'middle' }, svg); t.textContent = f2 + '°F'; }
  for (var v2 = 0; v2 <= 40; v2 += 10) { var t2 = S('text', { class: 'tx-sm', x: X0 - 8, y: yV(v2) + 4, 'text-anchor': 'end' }, svg); t2.textContent = v2; }
  var ylab = S('text', { class: 'tx-sm', x: 14, y: 156, transform: 'rotate(-90 14 156)', 'text-anchor': 'middle' }, svg); ylab.textContent = 'water vapor, grams per cubic meter';
  var curve = '', fogZone = '';
  for (var ff = 0; ff <= 100; ff += 1) { var c = F2C(ff), sv = sat(c); curve += (ff ? ' L' : 'M') + xF(ff).toFixed(1) + ',' + yV(Math.min(sv, VMAX + 20)).toFixed(1); }
  var clip = S('clipPath', { id: 'cn-dp-clip' }, S('defs', null, svg)); S('rect', { x: X0, y: Y1, width: X1 - X0, height: Y0 - Y1 }, clip);
  var cg = S('g', { 'clip-path': 'url(#cn-dp-clip)' }, svg);
  S('path', { class: 'cn-dp-fogz', d: curve + ' L' + xF(100) + ',' + Y1 + ' L' + xF(0) + ',' + Y1 + ' Z' }, cg);
  S('path', { class: 'cn-dp-curve', d: curve }, cg);
  var tCur = S('text', { class: 'tx-sm tx-b cn-dp-ct', x: xF(77), y: yV(33), 'text-anchor': 'end' }, svg); tCur.textContent = '100% humidity: air can’t hold more';
  var rhCurve = S('path', { class: 'cn-dp-rh' }, cg);
  var cool = S('path', { class: 'cn-dp-cool' }, svg);
  var surfL = S('path', { class: 'cn-dp-surf' }, svg), surfT = S('text', { class: 'tx-sm tx-b cn-dp-st', 'text-anchor': 'middle' }, svg);
  var dewPt = S('circle', { class: 'cn-dp-dew', r: 6 }, svg), dewT = S('text', { class: 'tx-sm tx-b cn-dp-dt', 'text-anchor': 'end' }, svg);
  var airPt = S('circle', { class: 'cn-dp-air', r: 8 }, svg), airT = S('text', { class: 'tx-sm tx-b tx-ink' }, svg);
  // the surface picture
  var pic = T.h('div', { class: 'tr-w-stage cn-dp-pic' }); left.appendChild(pic);
  var ps = S('svg', { viewBox: '0 0 520 110', role: 'img', 'aria-label': 'The cold surface, fogging up when it is colder than the dew point' }, pic);
  var surfG = S('g', null, ps), dropsG = S('g', null, ps);
  var drops = [];
  for (var i = 0; i < 70; i++) drops.push(S('circle', { class: 'cn-dp-drop', cx: 30 + Math.random() * 460, cy: 18 + Math.random() * 74, r: 0 }, dropsG));
  var side = T.h('div'); grid.appendChild(side);
  side.innerHTML =
    '<label class="tr-field">Room air temperature: <span class="v dp-v1"></span><input type="range" class="dp-air" min="50" max="95" step="1" value="70" aria-label="Air temperature in degrees Fahrenheit"></label>' +
    '<label class="tr-field">Relative humidity: <span class="v dp-v2"></span><input type="range" class="dp-rh" min="10" max="95" step="1" value="40" aria-label="Relative humidity in percent"></label>' +
    '<label class="tr-field">Surface temperature: <span class="v dp-v3"></span><input type="range" class="dp-surf" min="0" max="90" step="1" value="30" aria-label="Surface temperature in degrees Fahrenheit"></label>' +
    '<div class="tr-out dp-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  function drawSurface() {
    surfG.innerHTML = '';
    var k = st.kind;
    if (k === 'window' || k === 'mirror') {
      S('rect', { class: 'cn-dp-frame', x: 20, y: 8, width: 480, height: 94, rx: 4 }, surfG);
      S('rect', { class: 'cn-dp-glass', x: 30, y: 16, width: 460, height: 78 }, surfG);
      if (k === 'window') S('path', { class: 'cn-dp-frame2', d: 'M260,16 V94' }, surfG);
    } else if (k === 'wall') {
      S('rect', { class: 'cn-dp-conc', x: 20, y: 8, width: 480, height: 94 }, surfG);
      var d = ''; for (var y = 26; y < 100; y += 22) d += 'M20,' + y + ' H500 ';
      S('path', { class: 'cn-dp-joint', d: d }, surfG);
    } else {
      S('rect', { class: 'cn-dp-pipe', x: 10, y: 38, width: 500, height: 34, rx: 17 }, surfG);
    }
  }
  function update() {
    var c = F2C(st.air), rh = st.rh / 100, vap = sat(c) * rh, dc = dewC(c, rh), dF = C2F(dc), wet = st.surf <= dF;
    q('.dp-v1').textContent = st.air + ' °F'; q('.dp-v2').textContent = st.rh + '%'; q('.dp-v3').textContent = st.surf + ' °F';
    var ax = xF(st.air), ay = yV(vap), dx = xF(dF);
    airPt.setAttribute('cx', ax.toFixed(1)); airPt.setAttribute('cy', ay.toFixed(1));
    airT.setAttribute('x', (ax + 12).toFixed(1)); airT.setAttribute('y', (ay - 10).toFixed(1)); airT.setAttribute('text-anchor', st.air > 80 ? 'end' : 'start');
    if (st.air > 80) airT.setAttribute('x', (ax - 12).toFixed(1));
    airT.textContent = 'room air';
    dewPt.setAttribute('cx', dx.toFixed(1)); dewPt.setAttribute('cy', ay.toFixed(1));
    dewT.setAttribute('x', (dx - 10).toFixed(1)); dewT.setAttribute('y', (ay + 18).toFixed(1)); dewT.textContent = 'dew point ' + dF.toFixed(0) + '°F';
    cool.setAttribute('d', 'M' + ax.toFixed(1) + ',' + ay.toFixed(1) + ' H' + dx.toFixed(1));
    var rc = ''; for (var ff = 0; ff <= 100; ff++) rc += (ff ? ' L' : 'M') + xF(ff).toFixed(1) + ',' + yV(Math.min(VMAX + 20, sat(F2C(ff)) * rh)).toFixed(1);
    rhCurve.setAttribute('d', rc);
    var sx = xF(st.surf);
    surfL.setAttribute('d', 'M' + sx.toFixed(1) + ',' + Y0 + ' V' + Y1);
    surfL.setAttribute('class', 'cn-dp-surf' + (wet ? ' wet' : ''));
    surfT.setAttribute('x', sx.toFixed(1)); surfT.setAttribute('y', Y1 - 8); surfT.textContent = 'surface ' + st.surf + '°F';
    q('.dp-out').innerHTML =
      '<p>Air at ' + st.air + ' °F and ' + st.rh + '% humidity holds about <b>' + vap.toFixed(1) + ' g</b> of water vapor per cubic meter.</p>' +
      '<p>Cool it with no water added, and it reaches 100% at its dew point: <span class="big">' + dF.toFixed(0) + ' °F</span></p>' +
      (wet ? '<p class="warn">The surface (' + st.surf + ' °F) is at or below the dew point, so water condenses on it.</p>'
           : '<p class="ok">The surface (' + st.surf + ' °F) is ' + (st.surf - dF).toFixed(0) + ' °F above the dew point: it stays dry.</p>') +
      '<p class="hs-small">Fixes work on one side or the other: lower the humidity (fans, a dehumidifier, venting dryers outdoors) or keep the surface warmer (insulation, better windows).</p>';
    st.wet = wet; st.margin = dF - st.surf;
  }
  function anim(dt) {
    var target = st.wet ? Math.min(1, 0.35 + st.margin / 12) : 0;
    st.fog += (target - st.fog) * Math.min(1, dt * 1.2);
    drops.forEach(function (d, i) { var on = i / drops.length < st.fog; d.setAttribute('r', on ? (1.5 + (i % 5) * 0.7) * Math.min(1, st.fog * 1.4) : 0); });
    pic.classList.toggle('fogged', st.fog > 0.05);
  }
  function scenario(i) {
    var s = SC[i]; st.air = s[1]; st.rh = s[2]; st.surf = s[3]; st.kind = s[4];
    q('.dp-air').value = st.air; q('.dp-rh').value = st.rh; q('.dp-surf').value = st.surf;
    pick.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.i === i ? 'true' : 'false'); });
    drawSurface(); update();
  }
  pick.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) scenario(+b.dataset.i); });
  q('.dp-air').addEventListener('input', function (e) { st.air = +e.target.value; update(); });
  q('.dp-rh').addEventListener('input', function (e) { st.rh = +e.target.value; update(); });
  q('.dp-surf').addEventListener('input', function (e) { st.surf = +e.target.value; update(); });
  scenario(0);
  if (T.reduced) { st.fog = st.wet ? 1 : 0; anim(1); var ru = update; update = function () { ru(); st.fog = st.wet ? Math.min(1, 0.35 + st.margin / 12) : 0; anim(10); }; }
  else T.loop(root, anim);
})(window, document);
