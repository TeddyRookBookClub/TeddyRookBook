/* Our own diagram for the Putnam solutions guide: level curves of x^3 + 3xy + y^3; at level 1 they become a line and a point (2006 B1). */
(window.CompViz = window.CompViz || {})['putnam-2006-b1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Level curves of x cubed plus 3 x y plus y cubed. A slider moves the level k. Below 1 there is a small loop around the point minus 1, minus 1; at k equal to 1 the loop shrinks to that point and the rest becomes the straight line x plus y equals 1. The only equilateral triangle on the curve is drawn, with area 3 root 3 over 2.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var lab = D.createElement('label'); lab.style.cssText = 'display:flex;gap:8px;align-items:center;flex:1 1 220px;font-size:.92em';
  lab.textContent = 'level k';
  var sl = D.createElement('input'); sl.type = 'range'; sl.min = 0.6; sl.max = 1.4; sl.step = 0.01; sl.value = 0.85;
  sl.style.cssText = 'flex:1;min-width:120px'; lab.appendChild(sl); bar.appendChild(lab);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var X0 = -1.9, Y0 = -1.9, SPAN = 4.2, PX = 300, ox = 15, oy = 15, G = 120;
  function F(x, y) { return x * x * x + 3 * x * y + y * y * y; }
  function sx(x) { return ox + (x - X0) / SPAN * PX; }
  function sy(y) { return oy + PX - (y - Y0) / SPAN * PX; }
  function contour(k) {
    var d = '', i, j, h = SPAN / G, v = [];
    for (i = 0; i <= G; i++) { v.push([]); for (j = 0; j <= G; j++) v[i].push(F(X0 + i * h, Y0 + j * h) - k); }
    function cr(x1, y1, a, x2, y2, b) { var t = a / (a - b); return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; }
    for (i = 0; i < G; i++) for (j = 0; j < G; j++) {
      var x = X0 + i * h, y = Y0 + j * h, a = v[i][j], b = v[i + 1][j], c = v[i + 1][j + 1], e = v[i][j + 1], pts = [];
      if ((a < 0) !== (b < 0)) pts.push(cr(x, y, a, x + h, y, b));
      if ((b < 0) !== (c < 0)) pts.push(cr(x + h, y, b, x + h, y + h, c));
      if ((c < 0) !== (e < 0)) pts.push(cr(x + h, y + h, c, x, y + h, e));
      if ((e < 0) !== (a < 0)) pts.push(cr(x, y + h, e, x, y, a));
      for (var q = 0; q + 1 < pts.length; q += 2) d += 'M' + sx(pts[q][0]).toFixed(1) + ' ' + sy(pts[q][1]).toFixed(1) + 'L' + sx(pts[q + 1][0]).toFixed(1) + ' ' + sy(pts[q + 1][1]).toFixed(1);
    }
    return d;
  }
  function draw() {
    var c = api.colors(), k = +sl.value, at1 = M.abs(k - 1) < 0.005, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<line x1="' + sx(X0) + '" y1="' + sy(0) + '" x2="' + sx(X0 + SPAN) + '" y2="' + sy(0) + '" stroke="' + c.grid + '"/>';
    s += '<line x1="' + sx(0) + '" y1="' + sy(Y0) + '" x2="' + sx(0) + '" y2="' + sy(Y0 + SPAN) + '" stroke="' + c.grid + '"/>';
    if (at1) {
      var T = [[-1, -1], [0.5 + M.sqrt(0.75), 0.5 - M.sqrt(0.75)], [0.5 - M.sqrt(0.75), 0.5 + M.sqrt(0.75)]];
      s += '<path d="' + T.map(function (p, i) { return (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1); }).join('') + 'Z" fill="' + c.goldSoft + '" stroke="' + c.gold + '" stroke-width="2"/>';
      s += '<line x1="' + sx(-0.9) + '" y1="' + sy(1.9) + '" x2="' + sx(2.3) + '" y2="' + sy(-1.3) + '" stroke="' + c.green + '" stroke-width="3"/>';
    } else s += '<path d="' + contour(k) + '" fill="none" stroke="' + c.green + '" stroke-width="2.5" stroke-linecap="round"/>';
    s += '<circle cx="' + sx(-1) + '" cy="' + sy(-1) + '" r="' + (at1 ? 6 : 3) + '" fill="' + (at1 ? c.red : c.muted) + '"/>';
    svg.innerHTML = s;
    L('a', 340, 36, 'x^3 + 3xy + y^3 = ' + k.toFixed(2), c.green);
    L('b', 340, 74, 'x^3+3xy+y^3-1', c.ink);
    L('g', 340, 102, '\\quad = (x+y-1)\\,Q', c.ink);
    L('c', 340, 134, 'Q = x^2-xy+y^2+x+y+1', c.ink);
    L('d', 340, 168, 'Q = 0 \\iff (x,y)=(-1,-1)', c.red);
    L('e', 340, 220, at1 ? '\\text{area} = \\dfrac{h^2}{\\sqrt3} = \\dfrac{3\\sqrt3}{2}' : '\\text{set } k = 1', at1 ? c.gold : c.muted);
    cap.textContent = at1 ? 'At k = 1 the loop has shrunk to the single point (−1, −1), and the rest is the line x + y = 1. The equilateral triangle must use that point.'
      : k < 1 ? 'Below 1 a small loop surrounds (−1, −1), where the function has a local maximum of exactly 1.' : 'Above 1 the loop is gone.';
  }
  sl.addEventListener('input', draw);
  var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = 'k = 1';
  b.addEventListener('click', function () { sl.value = 1; draw(); }); bar.appendChild(b);
  api.onTheme(draw); draw();
};
