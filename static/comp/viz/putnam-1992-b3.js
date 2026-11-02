/* Our own diagram for the Putnam solutions guide: the convergence region of a_{n+1} = (a_n^2 + y^2)/2. */
(window.CompViz = window.CompViz || {})['putnam-1992-b3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'Left: the region where the sequence converges, a 2 by 2 square with a half-disk on each side. A test point moves around. Right: the first terms of its sequence, with the two fixed points r and R marked; terms settle at r inside the region and run off above R outside it.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, an) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : '-50%') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var PTS = [[0.3, 0.4], [1.6, 0.5], [1.95, 0.2], [2.05, 0.2], [-1.4, -0.8], [0.5, 1.2], [-1.75, 0.6]];
  var idx = 0, t = 0;
  function f(n) { return (+n).toFixed(1); }
  function draw() {
    var c = api.colors(), cx = 195, cy = 150, k = 68, s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    s += '<line x1="15" y1="' + cy + '" x2="375" y2="' + cy + '" stroke="' + c.axis + '"/><line x1="' + cx + '" y1="30" x2="' + cx + '" y2="270" stroke="' + c.axis + '"/>';
    var d = 'M' + (cx - k) + ' ' + (cy - k) + 'L' + (cx + k) + ' ' + (cy - k) + 'A' + k + ' ' + k + ' 0 0 1 ' + (cx + k) + ' ' + (cy + k) + 'L' + (cx - k) + ' ' + (cy + k) + 'A' + k + ' ' + k + ' 0 0 1 ' + (cx - k) + ' ' + (cy - k) + 'Z';
    s += '<path d="' + d + '" fill="' + c.greenSoft + '" stroke="' + c.green + '" stroke-width="2"/>';
    s += '<line x1="' + (cx - k) + '" y1="' + (cy - k) + '" x2="' + (cx - k) + '" y2="' + (cy + k) + '" stroke="' + c.green + '" stroke-dasharray="4 4"/><line x1="' + (cx + k) + '" y1="' + (cy - k) + '" x2="' + (cx + k) + '" y2="' + (cy + k) + '" stroke="' + c.green + '" stroke-dasharray="4 4"/>';
    var p = PTS[idx], x = p[0], y = p[1], R = 1 + M.sqrt(M.max(0, 1 - y * y)), r = 2 - R, inside = M.abs(y) <= 1 && M.abs(x) <= R;
    s += '<line x1="' + f(cx + k * -R) + '" y1="' + f(cy - k * y) + '" x2="' + f(cx + k * R) + '" y2="' + f(cy - k * y) + '" stroke="' + c.gold + '" stroke-width="2" stroke-dasharray="6 4"/>';
    s += '<circle cx="' + f(cx + k * x) + '" cy="' + f(cy - k * y) + '" r="6" fill="' + (inside ? c.green : c.red) + '" stroke="' + c.ink + '"/>';
    // right: a_n against n
    var gx = 420, gy = 280, sx = 15, sy = 70;
    s += '<line x1="' + gx + '" y1="' + gy + '" x2="625" y2="' + gy + '" stroke="' + c.axis + '"/><line x1="' + gx + '" y1="' + gy + '" x2="' + gx + '" y2="40" stroke="' + c.axis + '"/>';
    s += '<line x1="' + gx + '" y1="' + f(gy - sy * r) + '" x2="625" y2="' + f(gy - sy * r) + '" stroke="' + c.green + '" stroke-dasharray="4 4"/>';
    s += '<line x1="' + gx + '" y1="' + f(gy - sy * R) + '" x2="625" y2="' + f(gy - sy * R) + '" stroke="' + c.red + '" stroke-dasharray="4 4"/>';
    var a = (x * x + y * y) / 2, n, shown = M.min(13, M.floor(t) + 1);
    for (n = 0; n < shown; n++) {
      var yy = gy - sy * M.min(a, 3.3);
      s += '<circle cx="' + (gx + 10 + n * sx) + '" cy="' + f(yy) + '" r="4" fill="' + (a > 3.3 ? c.red : c.blue) + '"/>';
      a = (a * a + y * y) / 2;
    }
    svg.innerHTML = s;
    L('reg', 20, 292, '|y|\\le 1,\\ |x| \\le 1+\\sqrt{1-y^2}', c.green, 'l');
    L('area', 20, 316, '\\text{area} = 2\\cdot 2 + \\pi\\cdot 1^2 = 4+\\pi', c.ink, 'l');
    L('g', 425, 22, 'a_{n+1} = \\tfrac{a_n^2+y^2}{2}', c.ink, 'l');
    L('r', 612, gy - sy * r, 'r', c.green, 'r');
    L('R', 612, gy - sy * R, 'R', c.red, 'r');
    L('pt', 430, 305, '(x,y) = (' + x + ',\\ ' + y + ')', inside ? c.green : c.red, 'l');
    cap.textContent = inside ? 'This point is inside: |x| ≤ R, so the terms settle down to the smaller fixed point r.' : 'This point is outside: the first term is already above R, and the terms grow without bound.';
  }
  function btn(tt, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = tt; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; pb.textContent = 'Play'; }
  pb = btn('Play', function () {
    if (timer) return stop();
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); t += 1; if (t > 16) { t = 0; idx = (idx + 1) % PTS.length; } draw(); }, 300);
  });
  btn('Next point', function () { stop(); idx = (idx + 1) % PTS.length; t = 13; draw(); });
  t = 13; api.onTheme(draw); draw();
};
