/* Our own diagram for the Putnam solutions guide: comparing candidate shapes for maximizing a sum of cubes. */
(window.CompViz = window.CompViz || {})['putnam-2018-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'The curve y = t cubed on the interval from minus one to one. Ten dots sit on it: k of them at t = 1 and the rest at one equal negative value so the sum is zero. A bar compares the sum of cubes for k = 1 to 5; k = 3 is the largest, 120/49.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var FR = ['', '\\tfrac{80}{81}', '\\tfrac{15}{8}', '\\tfrac{120}{49}', '\\tfrac{20}{9}', '0'];
  var k = 3;
  function phi(k) { return k - k * k * k / ((10 - k) * (10 - k)); }
  function f(v) { return (+v).toFixed(1); }
  function draw() {
    var c = api.colors(), cx = 190, cy = 160, sx = 140, sy = 115, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<line x1="' + (cx - sx - 10) + '" y1="' + cy + '" x2="' + (cx + sx + 10) + '" y2="' + cy + '" stroke="' + c.axis + '"/><line x1="' + cx + '" y1="' + (cy - sy - 10) + '" x2="' + cx + '" y2="' + (cy + sy + 10) + '" stroke="' + c.axis + '"/>';
    var d = '', t;
    for (t = -1; t <= 1.0001; t += 0.05) d += (d ? 'L' : 'M') + f(cx + sx * t) + ' ' + f(cy - sy * t * t * t);
    s += '<path d="' + d + '" fill="none" stroke="' + c.green + '" stroke-width="2.5"/>';
    var neg = -k / (10 - k), i;
    for (i = 0; i < k; i++) s += '<circle cx="' + (cx + sx) + '" cy="' + f(cy - sy + i * 13) + '" r="6" fill="' + c.blue + '"/>';
    for (i = 0; i < 10 - k; i++) s += '<circle cx="' + f(cx + sx * neg) + '" cy="' + f(cy - sy * neg * neg * neg - i * 13) + '" r="6" fill="' + c.orange + '"/>';
    s += '<line x1="' + f(cx + sx * neg) + '" y1="' + cy + '" x2="' + f(cx + sx * neg) + '" y2="' + f(cy - sy * neg * neg * neg) + '" stroke="' + c.orange + '" stroke-dasharray="3 3"/>';
    for (i = 1; i <= 5; i++) {
      var bx = 400 + (i - 1) * 44, h = 50 * phi(i);
      s += '<rect x="' + bx + '" y="' + f(270 - h) + '" width="32" height="' + f(M.max(1, h)) + '" rx="3" fill="' + (i === k ? c.gold : c.grid) + '"/>';
      s += '<text x="' + (bx + 16) + '" y="290" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" fill="' + c.muted + '">k=' + i + '</text>';
    }
    svg.innerHTML = s;
    L('id', 400, 28, '\\cos 3x = 4c^3 - 3c', c.ink, 'l');
    L('cfg', 400, 60, k + '\\times(1),\\ ' + (10 - k) + '\\times\\big(-\\tfrac{' + k + '}{' + (10 - k) + '}\\big)', c.ink, 'l');
    L('val', 400, 92, '\\textstyle\\sum c_i^3 = ' + FR[k], k === 3 ? c.gold : c.ink, 'l');
    L('one', cx + sx - 30, cy - sy - 18, 't=1', c.blue, 'l');
    cap.textContent = 'k = ' + k + ' values at 1 and ' + (10 - k) + ' at ' + neg.toFixed(3) + ' (sum zero). Sum of cubes ' + phi(k).toFixed(4) + (k === 3 ? ': the best, 120/49, so the answer is 4 · 120/49 = 480/49.' : '.');
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  for (var j = 1; j <= 5; j++) (function (j) { btn('k = ' + j, function () { k = j; draw(); }); })(j);
  api.onTheme(draw); draw();
};
