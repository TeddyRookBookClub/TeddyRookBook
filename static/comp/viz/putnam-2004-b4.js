/* Our own diagram for the Putnam solutions guide: n rotations by 2π/n about the points 1..n add up to a shift by n (2004 B4). */
(window.CompViz = window.CompViz || {})['putnam-2004-b4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 340, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'A small flag shape is rotated by 2 pi over n about the points 1, 2, up to n on the x-axis, one rotation at a time, leaving a faint trail. After all n rotations the flag is back in its original direction, moved n units to the right.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translateY(-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var n = 4, step = 0, frac = 0, FLAG = [[0, 0.3], [0, 1.1], [0.5, 0.9], [0, 0.7]];
  function apply(k, t, p) { // rotate p by t*theta about (k,0)
    var th = t * 2 * M.PI / n, x = p[0] - k, y = p[1];
    return [k + x * M.cos(th) - y * M.sin(th), x * M.sin(th) + y * M.cos(th)];
  }
  function shape(st, fr) { return FLAG.map(function (p) { for (var k = 1; k <= st; k++) p = apply(k, 1, p); if (st < n && fr > 0) p = apply(st + 1, fr, p); return p; }); }
  function draw() {
    var c = api.colors(), yb = { 3: 2.1, 4: 2.4, 6: 3.1 }[n], u = M.min(560 / (n + 1.2), 236 / (yb + 1.2), 90), sx = 60, oy = 48 + 1.2 * u, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    function X(p) { return [sx + u * p[0], oy - u * p[1]]; }
    s += '<line x1="10" y1="' + oy + '" x2="' + (W - 10) + '" y2="' + oy + '" stroke="' + c.grid + '"/>';
    function poly(pts, fill, stroke, w, op) { return '<path d="' + pts.map(function (p, i) { var q = X(p); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + 'Z" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + w + '" opacity="' + op + '"/>'; }
    s += poly(FLAG.map(function (p) { return [p[0] + n, p[1]]; }), 'none', c.gold, 2, 0.9);
    var k;
    for (k = 0; k <= step && k <= n; k++) s += poly(shape(k, 0), k ? c.blueSoft : c.greenSoft, k ? c.blue : c.green, 1.5, k === step && frac === 0 ? 1 : 0.35);
    if (frac > 0) s += poly(shape(step, frac), c.blueSoft, c.blue, 2, 1);
    for (k = 1; k <= n; k++) { var q = X([k, 0]); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + oy + '" r="' + (k === step + 1 && step < n ? 7 : 4.5) + '" fill="' + (k === step + 1 && step < n ? c.red : c.ink) + '"/>'; }
    var o = X([0, 0]); s += '<circle cx="' + o[0] + '" cy="' + oy + '" r="3" fill="' + c.muted + '"/>';
    svg.innerHTML = s;
    for (k = 1; k <= 8; k++) { var lb = labs['p' + k]; if (lb) lb.d.style.display = k <= n ? '' : 'none'; if (k <= n) L('p' + k, sx + u * k - 5, oy + 20, '' + k, c.muted); }
    L('t', 20, 30, '\\theta = \\tfrac{2\\pi}{' + n + '},\\quad R_k(z) = \\omega(z-k)+k', c.ink);
    L('r', 20, 318, step >= n ? 'R(z) = z + ' + n + '\\quad\\text{(a shift)}' : '\\text{after } ' + step + '\\text{ of } ' + n + '\\text{ rotations}', step >= n ? c.gold : c.ink);
    cap.textContent = step >= n ? 'All ' + n + ' turns add up to a full turn, so the flag points the same way again. It has moved exactly ' + n + ' units right (gold outline).'
      : step === 0 ? 'The green flag will be turned about each red point in order. Press Play or Step.' : 'Turned about the points 1 to ' + step + '.';
  }
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; frac = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) { stop(); draw(); return; }
    if (step >= n) step = 0;
    pb.textContent = 'Pause';
    timer = setInterval(function () {
      if (!el.isConnected) return stop();
      frac += 0.08; if (frac >= 1) { frac = 0; step++; }
      draw(); if (step >= n) stop();
    }, 40);
  });
  btn('Step', function () { stop(); step = step >= n ? 0 : step + 1; draw(); });
  [3, 4, 6].forEach(function (m) { btn('n = ' + m, function () { stop(); n = m; step = 0; draw(); }); });
  if (api.reduced()) step = n;
  api.onTheme(draw); draw();
};
