/* Our own diagram for the Putnam solutions guide: the octagon area as the rectangle turns (2000 A3). */
(window.CompViz = window.CompViz || {})['putnam-2000-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math, DEG = M.PI / 180;
  var R2 = 2.5, R = M.sqrt(R2), dl = M.acos(0.8) / DEG; // alpha - beta = dl (degrees)
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A circle with a fixed inscribed square of area 5 and an inscribed rectangle of area 4 that can be turned with a slider. The octagon formed by all eight vertices is shaded, and its area is shown; it is largest, 3 times the square root of 5, when the two angles add to 90 degrees.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var lab = D.createElement('label'); lab.style.cssText = 'display:flex;gap:8px;align-items:center;flex:1 1 220px;font-size:.92em';
  lab.textContent = 'α + β';
  var sl = D.createElement('input'); sl.type = 'range'; sl.min = M.ceil(dl + 1); sl.max = M.floor(180 - dl - 1); sl.step = 0.5; sl.value = 60;
  sl.style.cssText = 'flex:1;min-width:120px'; lab.appendChild(sl); bar.appendChild(lab);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  function draw() {
    var c = api.colors(), sig = +sl.value, a = (sig + dl) / 2, b = (sig - dl) / 2;
    var cx = 160, cy = 160, u = 130 / R, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    function P(deg) { return [cx + u * R * M.cos(deg * DEG), cy - u * R * M.sin(deg * DEG)]; }
    var sq = [0, 90, 180, 270], rc = [a, 90 + b, 180 + a, 270 + b], all = [0, a, 90, 90 + b, 180, 180 + a, 270, 270 + b];
    function poly(arr, fill, stroke, w) { return '<path d="' + arr.map(function (d, i) { var p = P(d); return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('') + 'Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + w + '"/>'; }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (u * R) + '" fill="none" stroke="' + c.grid + '" stroke-width="1.5"/>';
    s += poly(all, c.goldSoft, c.gold, 2.5);
    all.forEach(function (d) { var p = P(d); s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) + '" stroke="' + c.grid + '"/>'; });
    s += poly(sq, 'none', c.green, 2) + poly(rc, 'none', c.blue, 2);
    all.forEach(function (d, i) { var p = P(d); s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="' + (i % 2 ? c.blue : c.green) + '"/>'; });
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + c.ink + '"/>';
    svg.innerHTML = s;
    var area = R2 * (M.sin(a * DEG) + M.cos(a * DEG) + M.sin(b * DEG) + M.cos(b * DEG)), best = 3 * M.sqrt(5);
    L('a', 330, 40, '\\text{square: } 2R^2 = 5', c.green);
    L('b', 330, 76, '\\text{rectangle: } 5\\cos(\\alpha-\\beta) = 4', c.blue);
    L('c', 330, 120, '\\alpha = ' + a.toFixed(1) + '^\\circ,\\ \\beta = ' + b.toFixed(1) + '^\\circ', c.ink);
    L('d', 330, 160, '\\text{area} = R^2(\\sin\\alpha+\\cos\\alpha', c.ink);
    L('g', 330, 190, '\\quad +\\sin\\beta+\\cos\\beta)', c.ink);
    L('e', 330, 222, '= ' + area.toFixed(4), c.gold);
    L('f', 330, 262, '\\max = 3\\sqrt5 \\approx ' + best.toFixed(4), c.muted);
    cap.textContent = M.abs(sig - 90) < 0.3 ? 'α + β = 90°: the octagon has its largest area, 3√5.'
      : 'The difference α − β is fixed by the rectangle. Slide the sum and watch the area; it peaks at α + β = 90°.';
  }
  sl.addEventListener('input', draw);
  var bb = D.createElement('button'); bb.type = 'button'; bb.className = 'cp-btn'; bb.textContent = 'Best';
  bb.addEventListener('click', function () { sl.value = 90; draw(); }); bar.appendChild(bb);
  api.onTheme(draw); draw();
};
