/* Construction course, Lesson 8: checking a corner for square with 3-4-5. Measure 4 units along one line and 3 along
   the other; if the corner is square, the diagonal between the marks is exactly 5 (Pythagoras: 3² + 4² = 5²).
   If it isn't, the law of cosines gives the diagonal: c² = a² + b² − 2ab·cos θ. Bigger triangles (6-8-10, 9-12-15)
   turn the same small angle error into a bigger, easier-to-read difference on the tape. */
(function (W, D) {
  'use strict';
  var root = D.getElementById('tr-w-square');
  if (!root || !W.TRTrades) return;
  var T = W.TRTrades, S = T.svg;
  var st = { k: 1, ang: 90, t: 0, playing: false };
  root.innerHTML = '';
  root.classList.add('cn-sq');
  var grid = T.h('div', { class: 'tr-w-grid' }); root.appendChild(grid);
  var left = T.h('div'); grid.appendChild(left);
  var stage = T.h('div', { class: 'tr-w-stage' }); left.appendChild(stage);
  var svg = S('svg', { viewBox: '0 0 520 360', role: 'img', 'aria-label': 'Two lines meeting at a corner, with a tape measuring 4 along one, 3 along the other, and the diagonal between the marks' }, stage);
  var C = [60, 320];
  var lineA = S('path', { class: 'cn-sq-line' }, svg), lineB = S('path', { class: 'cn-sq-line' }, svg);
  var arc = S('path', { class: 'cn-sq-arc' }, svg), tAng = S('text', { class: 'tx-sm tx-b tx-ink' }, svg);
  var tapeA = S('path', { class: 'cn-sq-tape' }, svg), tapeB = S('path', { class: 'cn-sq-tape' }, svg), tapeC = S('path', { class: 'cn-sq-tape c' }, svg);
  var ticks = S('g', null, svg);
  var mA = S('circle', { class: 'cn-sq-mark', r: 6 }, svg), mB = S('circle', { class: 'cn-sq-mark', r: 6 }, svg);
  var tA = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'middle' }, svg), tB = S('text', { class: 'tx-sm tx-b tx-ink', 'text-anchor': 'end' }, svg);
  var tC = S('text', { class: 'tx-b cn-sq-read', 'text-anchor': 'middle' }, svg);
  var ok = S('text', { class: 'tx-b cn-sq-ok', x: 500, y: 30, 'text-anchor': 'end' }, svg);
  S('circle', { class: 'cn-sq-corner', cx: C[0], cy: C[1], r: 5 }, svg);
  var ctrl = T.h('div', { class: 'tr-w-ctrl' }, '<button type="button" class="hs-btn sq-go">▶ Measure</button><div class="tr-seg sq-k" role="group" aria-label="Triangle size"><button type="button" data-k="1" aria-pressed="true">3-4-5</button><button type="button" data-k="2" aria-pressed="false">6-8-10</button><button type="button" data-k="3" aria-pressed="false">9-12-15</button></div>');
  left.appendChild(ctrl);
  var side = T.h('div'); grid.appendChild(side);
  side.innerHTML =
    '<label class="tr-field">Corner angle: <span class="v sq-v1"></span><input type="range" class="sq-ang" min="87" max="93" step="0.1" value="90" aria-label="Corner angle in degrees"></label>' +
    '<div class="tr-w-ctrl"><button type="button" class="hs-btn ghost sq-sq">Make it square</button><button type="button" class="hs-btn ghost sq-off">Knock it 1° out</button></div>' +
    '<div class="tr-out sq-out" aria-live="polite"></div>';
  var q = function (s) { return side.querySelector(s); };
  function fr(inches) { var n = Math.round(Math.abs(inches) * 16), w = Math.floor(n / 16), r = n % 16, d = 16; while (r && r % 2 === 0) { r /= 2; d /= 2; } return (w || !r ? w : '') + (r ? (w ? ' ' : '') + r + '/' + d : '') + '″'; }
  function ftin(ft) { var n = Math.round(ft * 12 * 16), f = Math.floor(n / 192), r = (n - f * 192) / 16; return f + '′ ' + fr(r); }
  function diag(k, ang) { var a = 4 * k, b = 3 * k, th = ang * Math.PI / 180; return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(th)); }
  function draw() {
    var k = st.k, s = Math.min(400 / (4 * k), 270 / (3 * k)), th = st.ang * Math.PI / 180;
    var ux = [1, 0], uy = [Math.cos(th), -Math.sin(th)];
    var A = [C[0] + 4 * k * s, C[1]], B = [C[0] + uy[0] * 3 * k * s, C[1] + uy[1] * 3 * k * s];
    lineA.setAttribute('d', 'M' + C[0] + ',' + C[1] + ' H505');
    var Lb = 300; lineB.setAttribute('d', 'M' + C[0] + ',' + C[1] + ' L' + (C[0] + uy[0] * Lb).toFixed(1) + ',' + (C[1] + uy[1] * Lb).toFixed(1));
    var r = 30; arc.setAttribute('d', 'M' + (C[0] + r) + ',' + C[1] + ' A' + r + ',' + r + ' 0 0 0 ' + (C[0] + uy[0] * r).toFixed(1) + ',' + (C[1] + uy[1] * r).toFixed(1));
    tAng.setAttribute('x', C[0] + 34); tAng.setAttribute('y', C[1] - 30); tAng.textContent = st.ang.toFixed(1) + '°';
    // animation phases: 0–1 tape A, 1–2 tape B, 2–3 diagonal
    var p = st.t, pa = Math.min(1, p), pb = Math.max(0, Math.min(1, p - 1)), pc = Math.max(0, Math.min(1, p - 2));
    var ea = [C[0] + (A[0] - C[0]) * pa, C[1]], eb = [C[0] + (B[0] - C[0]) * pb, C[1] + (B[1] - C[1]) * pb];
    tapeA.setAttribute('d', 'M' + C[0] + ',' + (C[1] + 9) + ' L' + ea[0].toFixed(1) + ',' + (C[1] + 9));
    tapeB.setAttribute('d', pb > 0 ? 'M' + (C[0] - 9) + ',' + C[1] + ' L' + (eb[0] - 9).toFixed(1) + ',' + eb[1].toFixed(1) : 'M0,0');
    var ec = [A[0] + (B[0] - A[0]) * pc, A[1] + (B[1] - A[1]) * pc];
    tapeC.setAttribute('d', pc > 0 ? 'M' + A[0].toFixed(1) + ',' + A[1].toFixed(1) + ' L' + ec[0].toFixed(1) + ',' + ec[1].toFixed(1) : 'M0,0');
    ticks.innerHTML = '';
    for (var f = 1; f <= 4 * k; f++) if (f * s <= (A[0] - C[0]) * pa + 0.5) S('path', { class: 'cn-sq-tick', d: 'M' + (C[0] + f * s).toFixed(1) + ',' + (C[1] + 5) + ' v8' }, ticks);
    for (var g = 1; g <= 3 * k; g++) if (g / (3 * k) <= pb + 1e-6) { var gx = C[0] + uy[0] * g * s, gy = C[1] + uy[1] * g * s; S('path', { class: 'cn-sq-tick', d: 'M' + (gx - 13).toFixed(1) + ',' + gy.toFixed(1) + ' h8' }, ticks); }
    mA.style.opacity = pa >= 1 ? 1 : 0; mA.setAttribute('cx', A[0].toFixed(1)); mA.setAttribute('cy', A[1]);
    mB.style.opacity = pb >= 1 ? 1 : 0; mB.setAttribute('cx', B[0].toFixed(1)); mB.setAttribute('cy', B[1].toFixed(1));
    tA.setAttribute('x', A[0].toFixed(1)); tA.setAttribute('y', C[1] + 32); tA.textContent = pa >= 1 ? 4 * k + ' ft' : '';
    tB.setAttribute('x', (B[0] - 16).toFixed(1)); tB.setAttribute('y', (B[1] + 4).toFixed(1)); tB.textContent = pb >= 1 ? 3 * k + ' ft' : '';
    var d = diag(k, st.ang), shownD = d * pc;
    var mx = (A[0] + B[0]) / 2 + 26, my = (A[1] + B[1]) / 2 - 14;
    tC.setAttribute('x', mx.toFixed(1)); tC.setAttribute('y', my.toFixed(1)); tC.textContent = pc > 0 ? ftin(shownD) : '';
    var diff = (d - 5 * k) * 12, square = Math.abs(diff) < 1 / 32;
    ok.textContent = pc >= 1 ? (square ? '✓ Square' : (diff > 0 ? 'Long by ' : 'Short by ') + fr(diff)) : '';
    ok.setAttribute('class', 'tx-b cn-sq-ok ' + (pc >= 1 ? (square ? 'y' : 'n') : ''));
  }
  function readout() {
    var k = st.k, d = diag(k, st.ang), diff = (d - 5 * k) * 12;
    q('.sq-v1').textContent = st.ang.toFixed(1) + '°' + (Math.abs(st.ang - 90) < 0.05 ? ' (square)' : '');
    var e1 = Math.abs(diag(1, 91) - 5) * 12, e3 = Math.abs(diag(3, 91) - 15) * 12;
    q('.sq-out').innerHTML =
      '<p>Target diagonal: <b>' + 5 * k + ' ft</b> <span class="hs-small">(' + 3 * k + '² + ' + 4 * k + '² = ' + 25 * k * k + ' = ' + 5 * k + '²)</span></p>' +
      '<p>Diagonal at this angle: <span class="big">' + ftin(d) + '</span></p>' +
      (Math.abs(diff) < 1 / 32 ? '<p class="ok">Right on: the corner is square.</p>'
        : '<p class="warn">' + (diff > 0 ? 'Too long by ' : 'Too short by ') + fr(diff) + ': the corner is ' + (diff > 0 ? 'more' : 'less') + ' than 90°. Swing the 3-' + (k > 1 ? 'unit' : 'foot') + ' line ' + (diff > 0 ? 'in' : 'out') + ' and measure again.</p>') +
      '<p class="hs-small">The same 1° error shows up as about ' + fr(e1) + ' on a 3-4-5 triangle but ' + fr(e3) + ' on a 9-12-15. Bigger triangles make small errors easier to see.</p>';
  }
  var raf = 0;
  function play() {
    if (T.reduced) { st.t = 3; draw(); return; }
    st.t = 0; var last = 0;
    function f(ts) {
      if (!last) last = ts; var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
      st.t += dt * 0.9;
      if (st.t >= 3) { st.t = 3; draw(); raf = 0; return; }
      draw(); raf = W.requestAnimationFrame(f);
    }
    if (raf) W.cancelAnimationFrame(raf);
    raf = W.requestAnimationFrame(f);
  }
  left.querySelector('.sq-go').addEventListener('click', play);
  left.querySelector('.sq-k').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    st.k = +b.dataset.k;
    left.querySelectorAll('.sq-k button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    readout(); play();
  });
  q('.sq-ang').addEventListener('input', function (e) { st.ang = +e.target.value; readout(); if (st.t >= 3) draw(); });
  q('.sq-sq').addEventListener('click', function () { st.ang = 90; q('.sq-ang').value = 90; readout(); st.t = 3; draw(); });
  q('.sq-off').addEventListener('click', function () { st.ang = 91; q('.sq-ang').value = 91; readout(); play(); });
  readout(); st.t = 3; draw();
})(window, document);
