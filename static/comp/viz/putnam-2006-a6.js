/* Our own diagram for the Putnam solutions guide: four random points in a disk, convex or not (2006 A6). */
(window.CompViz = window.CompViz || {})['putnam-2006-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 320, M = Math, EXACT = 1 - 35 / (12 * M.PI * M.PI);
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Left: a disk with four random points, joined as a convex quadrilateral or, when one point falls inside the triangle of the others, shown as that triangle. Right: the running share of convex samples, which settles near the dashed line at 0.7045.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(-50%,-50%);white-space:nowrap;font-size:clamp(10px,2.3vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; if (t) api.tex(t, o.d); else o.d.innerHTML = ''; }
  }
  var CX = 150, CY = 160, R = 135, pts = [], inner = -1, N = 0, good = 0, hist = [];
  function rnd() { var r = M.sqrt(M.random()), a = 2 * M.PI * M.random(); return [r * M.cos(a), r * M.sin(a)]; }
  function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
  function inside(p, a, b, c) { var s1 = cr(a, b, p) > 0, s2 = cr(b, c, p) > 0, s3 = cr(c, a, p) > 0; return s1 === s2 && s2 === s3; }
  function sample() {
    pts = [rnd(), rnd(), rnd(), rnd()]; inner = -1;
    for (var i = 0; i < 4; i++) { var o = pts.filter(function (_, j) { return j !== i; }); if (inside(pts[i], o[0], o[1], o[2])) inner = i; }
    N++; if (inner < 0) good++;
    if (N <= 50 || N % 20 === 0) hist.push([N, good / N]);
  }
  function many(k) { for (var i = 0; i < k; i++) sample(); }
  function X(p) { return (CX + R * p[0]).toFixed(1); } function Y(p) { return (CY - R * p[1]).toFixed(1); }
  function draw() {
    var c = api.colors(), s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + R + '" fill="' + c.bg + '" stroke="' + c.axis + '" stroke-width="1.5"/>';
    if (pts.length) {
      var poly;
      if (inner < 0) { // convex: order by angle around centroid
        var gx = 0, gy = 0; pts.forEach(function (p) { gx += p[0] / 4; gy += p[1] / 4; });
        poly = pts.slice().sort(function (a, b) { return M.atan2(a[1] - gy, a[0] - gx) - M.atan2(b[1] - gy, b[0] - gx); });
      } else poly = pts.filter(function (_, j) { return j !== inner; });
      var col = inner < 0 ? c.green : c.red;
      s += '<polygon points="' + poly.map(function (p) { return X(p) + ',' + Y(p); }).join(' ') + '" fill="' + col + '" fill-opacity="0.16" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round"/>';
      pts.forEach(function (p, i) { s += '<circle cx="' + X(p) + '" cy="' + Y(p) + '" r="' + (i === inner ? 7 : 5.5) + '" fill="' + (i === inner ? c.gold : c.ink) + '"/>'; });
    }
    // running estimate chart
    var x0 = 330, x1 = 620, y0 = 280, y1 = 110, lo = 0.55, hi = 0.85, maxN = M.max(100, N);
    function px(n) { return x0 + (x1 - x0) * M.log(n) / M.log(maxN); }
    function py(v) { return y0 - (y0 - y1) * (M.min(hi, M.max(lo, v)) - lo) / (hi - lo); }
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + c.axis + '"/><line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '" stroke="' + c.axis + '"/>';
    s += '<line x1="' + x0 + '" y1="' + py(EXACT).toFixed(1) + '" x2="' + x1 + '" y2="' + py(EXACT).toFixed(1) + '" stroke="' + c.gold + '" stroke-width="2" stroke-dasharray="7 5"/>';
    if (hist.length > 1) s += '<polyline fill="none" stroke="' + c.green + '" stroke-width="2" points="' + hist.map(function (h) { return px(h[0]).toFixed(1) + ',' + py(h[1]).toFixed(1); }).join(' ') + '"/>';
    var f = 'font-size="12" font-family="system-ui,sans-serif" fill="' + c.muted + '"';
    s += '<text x="' + x0 + '" y="' + (y0 + 16) + '" ' + f + '>1</text><text x="' + x1 + '" y="' + (y0 + 16) + '" ' + f + ' text-anchor="end">' + maxN + ' samples (log scale)</text>';
    s += '<text x="' + (x0 - 4) + '" y="' + (py(lo) + 4) + '" ' + f + ' text-anchor="end">' + lo + '</text><text x="' + (x0 - 4) + '" y="' + (py(hi) + 4) + '" ' + f + ' text-anchor="end">' + hi + '</text>';
    svg.innerHTML = s;
    L('a', 475, 30, N ? '\\text{convex: } ' + good + '/' + N + ' = ' + (good / N).toFixed(4) : '\\text{press Play}', c.ink);
    L('b', 475, 66, '1-\\dfrac{35}{12\\pi^2}\\approx ' + EXACT.toFixed(4), c.gold);
    cap.textContent = !pts.length ? 'Each sample drops four uniform points in the disk.'
      : inner < 0 ? 'This sample is convex: no point lies inside the triangle of the other three.'
      : 'Not convex: the gold point fell inside the red triangle. The chance of that is 4 × (average triangle area)/(disk area).';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); many(N < 200 ? 1 : N < 2000 ? 10 : 100); draw(); if (N >= 100000) stop(); }, api.reduced() ? 400 : 120);
  });
  btn('One sample', function () { stop(); many(1); draw(); });
  btn('+10,000', function () { stop(); many(10000); draw(); });
  btn('Reset', function () { stop(); pts = []; inner = -1; N = 0; good = 0; hist = []; draw(); });
  many(1); api.onTheme(draw); draw();
};
