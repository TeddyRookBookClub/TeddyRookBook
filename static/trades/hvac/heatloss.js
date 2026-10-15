/* HVAC course, Lesson 10: steady heat flow through one flat layer, Q = A * dT / R (OpenStax College Physics 2e, 14.5;
   R in ft^2*F*h/Btu). 1 Btu/h = 0.2930711 W (NIST SP 811). Recommended attic levels for an uninsulated attic by climate
   zone are ENERGY STAR's (based on the 2021 IECC): zone 1 R-30, zones 2-3 R-49, zones 4-8 R-60. R-11 and R-19 are the
   OpenStax batt examples (3.5-inch and 6.5-inch fiberglass). Ignores framing, air leaks and sunshine. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-heatloss');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg, BTUW = 0.2930711;
  root.innerHTML = '';
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var stage = T.h('div', { class: 'tr-w-stage' }); grid.appendChild(stage);
  var side = T.h('div'); grid.appendChild(side);
  var svg = S('svg', { viewBox: '0 0 460 400', role: 'img', class: 'hv-hl', 'aria-label': 'Heat flowing through a layer of insulation from the warm side to the cold side, and a chart of heat flow against R-value' }, stage);
  svg.innerHTML = '<defs><linearGradient id="hl-g" x1="0" x2="1" y1="0" y2="0"><stop class="hl-s1" offset="0"/><stop class="hl-s2" offset="1"/></linearGradient>' +
    '<marker id="hl-a" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="hl-ah"/></marker></defs>';
  // section drawing (top)
  var leftBg = S('rect', { class: 'hl-in', x: 10, y: 28, width: 220, height: 160, rx: 8 }, svg);
  var rightBg = S('rect', { class: 'hl-out', x: 230, y: 28, width: 220, height: 160, rx: 8 }, svg);
  var ins = S('rect', { class: 'hl-ins', y: 36, height: 144, rx: 4 }, svg);
  var insPat = S('path', { class: 'hl-insp' }, svg);
  var dry1 = S('rect', { class: 'hl-board', y: 36, width: 6, height: 144 }, svg), dry2 = S('rect', { class: 'hl-board', y: 36, width: 6, height: 144 }, svg);
  var arrows = [0, 1, 2].map(function (i) { return S('path', { class: 'hl-arr', 'marker-end': 'url(#hl-a)' }, svg); });
  var tL = S('text', { class: 'hv-t hv-tb', x: 20, y: 50 }, svg), tL2 = S('text', { class: 'hv-ts', x: 20, y: 64 }, svg);
  var tR = S('text', { class: 'hv-t hv-tb', x: 440, y: 50, 'text-anchor': 'end' }, svg), tR2 = S('text', { class: 'hv-ts', x: 440, y: 64, 'text-anchor': 'end' }, svg);
  var tRv = S('text', { class: 'hv-tag hl-rv', x: 230, y: 204, 'text-anchor': 'middle' }, svg);
  var tQ = S('text', { class: 'hv-tag hl-q', x: 230, y: 18, 'text-anchor': 'middle' }, svg);
  // chart (bottom): Q vs R
  var CX0 = 52, CX1 = 446, CY0 = 368, CY1 = 222, RMAX = 60;
  S('rect', { class: 'hl-plot', x: CX0, y: CY1, width: CX1 - CX0, height: CY0 - CY1 }, svg);
  var cAxes = S('g', null, svg), curve = S('path', { class: 'hl-curve' }, svg), marks = S('g', null, svg), cur = S('circle', { class: 'hl-cur', r: 7 }, svg), curT = S('text', { class: 'hv-tag hl-curt' }, svg);
  var recLine = S('path', { class: 'hl-rec' }, svg), recT = S('text', { class: 'hv-tag hl-rect' }, svg);
  S('text', { class: 'hv-ts', x: (CX0 + CX1) / 2, y: 396, 'text-anchor': 'middle' }, svg).textContent = 'R-value';
  var yLab = S('text', { class: 'hv-ts', x: 12, y: (CY0 + CY1) / 2, 'text-anchor': 'middle', transform: 'rotate(-90 12 ' + (CY0 + CY1) / 2 + ')' }, svg);

  side.innerHTML =
    '<div class="hv-head"><h3>Heat-loss calculator</h3><span>Q = A × ΔT ÷ R</span></div>' +
    '<label class="tr-field">Insulation: <span class="v hl-v1"></span><input type="range" class="hl-r" min="1" max="60" step="1" value="11" aria-label="R-value"></label>' +
    '<div class="tr-w-ctrl" role="group" aria-label="R-value examples">' + [11, 19, 30, 38, 49, 60].map(function (r) { return '<button type="button" class="hs-btn ghost hl-pre" data-r="' + r + '">R-' + r + '</button>'; }).join('') + '</div>' +
    '<label class="tr-field">Area: <span class="v hl-v2"></span><input type="range" class="hl-a" min="50" max="2000" step="10" value="1000" aria-label="Area in square feet"></label>' +
    '<label class="tr-field">Inside: <span class="v hl-v3"></span><input type="range" class="hl-ti" min="55" max="80" step="1" value="70" aria-label="Inside temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Outside: <span class="v hl-v4"></span><input type="range" class="hl-to" min="-20" max="110" step="1" value="20" aria-label="Outside temperature, degrees Fahrenheit"></label>' +
    '<label class="tr-field">Your climate zone (for the attic): <select class="hl-zone" aria-label="Climate zone">' + [1, 2, 3, 4, 5, 6, 7, 8].map(function (z) { return '<option value="' + z + '"' + (z === 5 ? ' selected' : '') + '>Zone ' + z + '</option>'; }).join('') + '</select></label>' +
    '<div class="tr-out hl-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  var iR = q('.hl-r'), iA = q('.hl-a'), iTi = q('.hl-ti'), iTo = q('.hl-to'), sZ = q('.hl-zone'), elOut = q('.hl-out');
  function umode() { try { return W.TRBUnits ? W.TRBUnits.mode() : 'both'; } catch (e) { return 'both'; } }
  function f2c(f) { return (f - 32) * 5 / 9; }
  function mn(x) { return String(Math.round(x)).replace('-', '−'); }
  function tf(f) { var m = umode(), a = mn(f) + '°F', b = mn(f2c(f)) + '°C'; return m === 'us' ? a : m === 'metric' ? b : a + ' (' + b + ')'; }
  function af(a) { var m = umode(), x = T.fmt(a, 0) + ' ft²', y = T.fmt(a * 0.09290304, a * 0.0929 < 10 ? 1 : 0) + ' m²'; return m === 'us' ? x : m === 'metric' ? y : x + ' (' + y + ')'; }
  function rS(r) { var m = umode(), si = (r * 0.1761102).toFixed(r < 6 ? 2 : 1); return m === 'metric' ? 'R-' + r + ' (RSI ' + si + ')' : 'R-' + r + (m === 'both' ? ' (RSI ' + si + ' m²·K/W)' : ''); }
  function rec(z) { return z === 1 ? 30 : z <= 3 ? 49 : 60; }
  function cX(r) { return CX0 + r / RMAX * (CX1 - CX0); }
  function update() {
    var R = +iR.value, A = +iA.value, ti = +iTi.value, to = +iTo.value, dT = ti - to, Q = A * Math.abs(dT) / R, Wt = Q * BTUW, z = +sZ.value, rz = rec(z);
    var winter = dT >= 0;
    q('.hl-v1').textContent = rS(R); q('.hl-v2').textContent = af(A); q('.hl-v3').textContent = tf(ti); q('.hl-v4').textContent = tf(to);
    side.querySelectorAll('.hl-pre').forEach(function (b) { b.setAttribute('aria-pressed', +b.dataset.r === R ? 'true' : 'false'); });
    // section drawing
    var w = 14 + R * 2.6, x0 = 230 - w / 2, x1 = 230 + w / 2;
    ins.setAttribute('x', x0.toFixed(1)); ins.setAttribute('width', w.toFixed(1));
    dry1.setAttribute('x', (x0 - 6).toFixed(1)); dry2.setAttribute('x', x1.toFixed(1));
    var pd = ''; for (var y = 46; y < 176; y += 12) pd += 'M' + (x0 + 3).toFixed(1) + ',' + y + ' q' + (w / 4).toFixed(1) + ',-6 ' + (w / 2 - 3).toFixed(1) + ',0 t' + (w / 2 - 3).toFixed(1) + ',0 ';
    insPat.setAttribute('d', pd);
    leftBg.setAttribute('class', 'hl-in ' + (ti >= to ? 'hl-warm' : 'hl-cool'));
    rightBg.setAttribute('class', 'hl-out ' + (to > ti ? 'hl-warm' : 'hl-cool'));
    svg.querySelector('.hl-s1').setAttribute('stop-color', ti >= to ? '#e8743b' : '#4f97d1');
    svg.querySelector('.hl-s2').setAttribute('stop-color', ti >= to ? '#4f97d1' : '#e8743b');
    ins.setAttribute('fill', 'url(#hl-g)');
    var thick = Math.max(2, Math.min(16, 2 + 14 * Math.sqrt(Q / 15000)));
    arrows.forEach(function (a, i) {
      var yy = 92 + i * 34;
      a.setAttribute('d', winter ? 'M40,' + yy + ' H420' : 'M420,' + yy + ' H40');
      a.setAttribute('stroke-width', (dT === 0 ? 0 : thick).toFixed(1));
      a.setAttribute('opacity', dT === 0 ? 0 : 0.8);
    });
    tL.textContent = 'inside ' + tf(ti); tL2.textContent = winter ? 'warm side' : 'cool side';
    tR.textContent = 'outside ' + tf(to); tR2.textContent = winter ? 'cold side' : 'hot side';
    tRv.textContent = 'R-' + R;
    tQ.textContent = dT === 0 ? 'no temperature difference, no heat flow' : (winter ? 'heat flows out: ' : 'heat flows in: ') + T.fmt(Q, 0) + ' BTU/h';
    // chart
    var qMax = A * Math.max(10, Math.abs(dT)) / 4;   // y-axis top: the R-4 value
    function cY(qq) { return CY0 - Math.min(1, qq / qMax) * (CY0 - CY1); }
    cAxes.innerHTML = '';
    [10, 20, 30, 40, 50, 60].forEach(function (r) { S('path', { class: 'hl-grid', d: 'M' + cX(r).toFixed(1) + ',' + CY1 + ' V' + CY0 }, cAxes); var t = S('text', { class: 'hv-ts', x: cX(r), y: CY0 + 13, 'text-anchor': 'middle' }, cAxes); t.textContent = r; });
    [0, 0.5, 1].forEach(function (f) { var t = S('text', { class: 'hv-ts', x: CX0 - 4, y: cY(f * qMax) + 4, 'text-anchor': 'end' }, cAxes); t.textContent = T.fmt(f * qMax / 1000, f === 0.5 ? 1 : 0) + 'k'; });
    yLab.textContent = 'heat flow, BTU/h';
    var d = ''; for (var r = 4; r <= RMAX; r += 0.5) { var qq = A * Math.abs(dT) / r; d += (d ? ' L' : 'M') + cX(r).toFixed(1) + ',' + cY(qq).toFixed(1); }
    curve.setAttribute('d', d);
    marks.innerHTML = '';
    [11, 19, 30, 38, 49, 60].forEach(function (r) { S('circle', { class: 'hl-mark', cx: cX(r), cy: cY(A * Math.abs(dT) / r), r: 3.5 }, marks); });
    cur.setAttribute('cx', cX(R).toFixed(1)); cur.setAttribute('cy', cY(Q).toFixed(1));
    curT.setAttribute('x', (cX(R) + 10).toFixed(1)); curT.setAttribute('y', (cY(Q) - 8).toFixed(1)); curT.textContent = T.fmt(Q, 0) + ' BTU/h';
    if (cX(R) > 360) { curT.setAttribute('x', (cX(R) - 10).toFixed(1)); curT.setAttribute('text-anchor', 'end'); } else curT.setAttribute('text-anchor', 'start');
    recLine.setAttribute('d', 'M' + cX(rz).toFixed(1) + ',' + CY1 + ' V' + CY0);
    recT.setAttribute('x', (cX(rz) - 4).toFixed(1)); recT.setAttribute('y', CY1 + 12); recT.setAttribute('text-anchor', 'end'); recT.textContent = 'zone ' + z + ' attic: R-' + rz;
    // readout
    var q11 = A * Math.abs(dT) / 11, html = '';
    html += '<p>Heat flow: <span class="big">' + T.fmt(Q, 0) + ' BTU/h</span> = ' + T.fmt(Wt, 0) + ' watts</p>';
    html += '<p class="hs-small">' + T.fmt(A, 0) + ' × ' + Math.abs(dT) + ' ÷ ' + R + ' = ' + T.fmt(Q, 0) + '. Held for a whole day at these temperatures, that’s about ' + T.fmt(Wt * 24 / 1000, 1) + ' kWh of heat ' + (winter ? 'to replace' : 'to remove') + '.</p>';
    if (R !== 11 && dT !== 0) html += '<p>Compared with R-11: ' + (Q < q11 ? T.fmt(q11 - Q, 0) + ' BTU/h less (' + Math.round(100 * (1 - Q / q11)) + '% less).' : T.fmt(Q - q11, 0) + ' BTU/h more.') + '</p>';
    html += '<p>ENERGY STAR recommends <b>R-' + rz + '</b> for an uninsulated attic in zone ' + z + (R >= rz ? ': <span class="hv-ok">this layer meets it.</span>' : '.') + '</p>';
    elOut.innerHTML = html;
  }
  side.querySelectorAll('.hl-pre').forEach(function (b) { b.addEventListener('click', function () { iR.value = b.dataset.r; update(); }); });
  [iR, iA, iTi, iTo].forEach(function (i) { i.addEventListener('input', update); });
  sZ.addEventListener('change', update);
  D.addEventListener('trb-units', update);
  update();
})(window, document);
