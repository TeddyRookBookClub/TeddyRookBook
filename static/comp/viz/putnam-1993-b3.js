/* Our own diagram for the Putnam solutions guide: random darts and the even-rounding wedges (1993 B3). */
(window.CompViz = window.CompViz || {})['putnam-1993-b3'] = function (el, api) {
  var W = 640, H = 320, ARIA = 'The unit square with green wedges where x over y rounds to an even number: a wedge near the y-axis for 0 and thin wedges along the right edge for 2, 4, 6. Random darts land in the square, and their green share approaches (5 minus pi)/4, about 0.4646.';
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block'; svg.setAttribute('aria-label', ARIA);
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function btn(tt, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = tt; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  function f1(v) { return (+v).toFixed(1); }
  var dots = [], hit = 0, timer = 0, pb;
  var X0 = 30, Y0 = 290, S = 260;
  function P(x, y) { return f1(X0 + S * x) + ' ' + f1(Y0 - S * y); }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>', k;
    s += '<path d="M' + P(0, 0) + 'L' + P(0, 1) + 'L' + P(0.5, 1) + 'Z" fill="' + c.greenSoft + '"/>';
    for (k = 2; k <= 60; k += 2) s += '<path d="M' + P(0, 0) + 'L' + P(1, 1 / (k + 0.5)) + 'L' + P(1, 1 / (k - 0.5)) + 'Z" fill="' + c.greenSoft + '"/>';
    for (k = 0; k <= 9; k++) { var sl = 1 / (k + 0.5), ex = sl > 1 ? 1 / sl : 1, ey = sl > 1 ? 1 : sl; s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + f1(X0 + S * ex) + '" y2="' + f1(Y0 - S * ey) + '" stroke="' + c.grid + '"/>'; }
    s += '<rect x="' + X0 + '" y="' + (Y0 - S) + '" width="' + S + '" height="' + S + '" fill="none" stroke="' + c.axis + '"/>';
    dots.forEach(function (d) { s += '<circle cx="' + f1(X0 + S * d[0]) + '" cy="' + f1(Y0 - S * d[1]) + '" r="1.8" fill="' + (d[2] ? c.green : c.red) + '"/>'; });
    svg.innerHTML = s;
    L('x', X0 + S + 4, Y0, 'x', c.muted, 'l'); L('y', X0 - 4, Y0 - S, 'y', c.muted, 'r');
    L('k0', X0 + 34, Y0 - S + 22, '0', c.green, 'c'); L('k2', X0 + S - 14, Y0 - S * 0.52, '2', c.green, 'c'); L('k1', X0 + S - 14, Y0 - S * 0.8, '1', c.red, 'c');
    L('f1', 320, 50, 'P(\\text{nearest}=0)=\\tfrac14', c.ink, 'l');
    L('f2', 320, 95, 'P(\\text{nearest}=k)=\\tfrac1{2k-1}-\\tfrac1{2k+1}', c.ink, 'l');
    L('f3', 320, 140, '\\tfrac14+\\big(\\tfrac13-\\tfrac15+\\tfrac17-\\cdots\\big)', c.ink, 'l');
    L('f4', 320, 185, '=\\tfrac14+1-\\tfrac\\pi4=\\tfrac{5-\\pi}{4}\\approx 0.4646', c.green, 'l');
    var n = dots.length;
    L('f5', 320, 245, n ? '\\text{darts: }' + hit + '/' + n + '=' + (hit / n).toFixed(4) : '\\text{press Throw}', c.muted, 'l');
    cap.textContent = 'Green wedges: points where x/y rounds to an even number (0, 2, 4, …). Thrown darts: ' + n + ', green share ' + (n ? (hit / n).toFixed(3) : '—') + '.';
  }
  function throwN(m) {
    for (var i = 0; i < m; i++) { var x = M.random(), y = M.random(), r = M.round(x / y), g = r % 2 === 0; if (g) hit++; dots.push([x, y, g]); }
    if (dots.length > 3000) { dots = dots.slice(-3000); }
    draw();
  }
  var total = 0;
  function stop() { clearInterval(timer); timer = 0; if (pb) pb.textContent = 'Play'; }
  if (!api.reduced()) pb = btn('Play', function () { if (timer) return stop(); pb.textContent = 'Pause'; timer = setInterval(function () { if (!el.isConnected) return stop(); throwN(40); }, 120); });
  btn('Throw 200', function () { throwN(200); });
  btn('Reset', function () { stop(); dots = []; hit = 0; draw(); });
  api.onTheme(draw); draw();
};
