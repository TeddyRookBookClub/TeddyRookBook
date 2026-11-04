/* Our own diagram for the Putnam solutions guide: a narrow parabola inside the unit circle (2001 A6). */
(window.CompViz = window.CompViz || {})['putnam-2001-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'The unit circle and the parabola y = a x squared minus 1 inside it. A slider changes a from 1 to 1000; the exact arc length is shown and passes 4 once a is about 35 or more.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var lab = D.createElement('label'); lab.style.cssText = 'display:flex;gap:8px;align-items:center;flex:1 1 220px;font-size:.92em';
  lab.textContent = 'a';
  var sl = D.createElement('input'); sl.type = 'range'; sl.min = 0; sl.max = 3; sl.step = 0.01; sl.value = 0.7;
  sl.style.cssText = 'flex:1;min-width:120px'; lab.appendChild(sl); bar.appendChild(lab);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function len(a) { // 2 * integral_0^x0 sqrt(1+4a^2x^2) dx, exact
    var x0 = M.sqrt(2 * a - 1) / a, T = 2 * a * x0;
    return (T * M.sqrt(1 + T * T) + M.log(T + M.sqrt(1 + T * T))) / (2 * a);
  }
  function draw() {
    var c = api.colors(), a = M.pow(10, +sl.value), cx = 160, cy = 160, u = 140;
    var s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<line x1="' + (cx - u - 10) + '" y1="' + cy + '" x2="' + (cx + u + 10) + '" y2="' + cy + '" stroke="' + c.grid + '"/>';
    s += '<line x1="' + cx + '" y1="' + (cy - u - 10) + '" x2="' + cx + '" y2="' + (cy + u + 10) + '" stroke="' + c.grid + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + u + '" fill="none" stroke="' + c.green + '" stroke-width="2"/>';
    var x0 = M.sqrt(2 * a - 1) / a, d = '', i, N = 240;
    for (i = 0; i <= N; i++) {
      var t = 2 * i / N - 1, x = x0 * t * M.abs(t); // more samples near the vertex
      var y = a * x * x - 1;
      d += (i ? 'L' : 'M') + (cx + u * x).toFixed(2) + ' ' + (cy - u * y).toFixed(2);
    }
    s += '<path d="' + d + '" fill="none" stroke="' + c.gold + '" stroke-width="3" stroke-linejoin="round"/>';
    [[-x0, a * x0 * x0 - 1], [x0, a * x0 * x0 - 1], [0, -1]].forEach(function (p) {
      s += '<circle cx="' + (cx + u * p[0]).toFixed(1) + '" cy="' + (cy - u * p[1]).toFixed(1) + '" r="4.5" fill="' + c.ink + '"/>';
    });
    svg.innerHTML = s;
    var Lg = len(a), ok = Lg > 4;
    L('a', 330, 40, 'y = ax^2 - 1', c.gold);
    L('b', 330, 80, 'a = ' + (a < 10 ? a.toFixed(2) : a.toFixed(0)), c.ink);
    L('c', 330, 124, 'L = 2\\int_0^{x_0}\\sqrt{1+4a^2x^2}\\,dx', c.ink);
    L('d', 330, 170, 'L = ' + Lg.toFixed(5), ok ? c.green : c.red);
    L('e', 330, 210, 'L - 4 = ' + (Lg - 4 >= 0 ? '+' : '') + (Lg - 4).toFixed(5), ok ? c.green : c.red);
    L('f', 330, 256, '\\text{ends at height } 1 - \\tfrac1a', c.muted);
    cap.textContent = ok ? 'Longer than 4: going up and down almost a full diameter, plus the sideways wiggle near the bottom, beats the shortfall at the top.'
      : 'Shorter than 4 so far. Make the parabola narrower (larger a).';
  }
  sl.addEventListener('input', draw);
  [10, 100, 1000].forEach(function (v) {
    var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = 'a = ' + v;
    b.addEventListener('click', function () { sl.value = M.log(v) / M.LN10; draw(); }); bar.appendChild(b);
  });
  api.onTheme(draw); draw();
};
