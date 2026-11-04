/* Our own diagram for the Putnam solutions guide: the 60-degree rotation that builds a triangle with sides a, b, c (2003 B5). */
(window.CompViz = window.CompViz || {})['putnam-2003-b5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', W = 640, H = 330, M = Math;
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto;overflow:hidden;touch-action:none';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.style.display = 'block';
  svg.setAttribute('aria-label', 'An equilateral triangle A B C in the unit circle and a point P that can be dragged inside it. Rotating P by 60 degrees about C gives P prime; the triangle P P prime A is shaded, with sides a, b, c. Its area is shown next to the formula square root of 3 over 4 times 1 minus OP squared, and the two always agree.');
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {};
  function L(k, x, y, t, col, mid) {
    var o = labs[k]; if (!o) { o = labs[k] = { d: D.createElement('div'), t: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / H * 100) + '%;transform:translate(' + (mid ? '-50%' : '0') + ',-50%);white-space:nowrap;font-size:clamp(10px,2.4vw,15px);color:' + col;
    if (o.t !== t) { o.t = t; api.tex(t, o.d); }
  }
  var cx = 122, cy = 116, u = 104, P = [0.35, 0.2], ang = 0;
  var V = [0, 1, 2].map(function (k) { var t = 2 * M.PI * k / 3; return [M.cos(t), M.sin(t)]; }); // A, B, C
  function rot(p) { // rotation about C by -60 degrees, sends B to A
    var C = V[2], t = -M.PI / 3, x = p[0] - C[0], y = p[1] - C[1];
    return [C[0] + x * M.cos(t) - y * M.sin(t), C[1] + x * M.sin(t) + y * M.cos(t)];
  }
  function S(p) { return [cx + u * p[0], cy - u * p[1]]; }
  function dist(p, q) { return M.hypot(p[0] - q[0], p[1] - q[1]); }
  function draw() {
    var c = api.colors(), Pp = rot(P), A = V[0], s = '<rect width="' + W + '" height="' + H + '" fill="' + c.panel + '" rx="6"/>';
    function seg(p, q, col, w, dash) { var a = S(p), b = S(q); return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + col + '" stroke-width="' + w + '"' + (dash ? ' stroke-dasharray="5 4"' : '') + '/>'; }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + u + '" fill="none" stroke="' + c.grid + '" stroke-width="1.5"/>';
    s += '<path d="' + V.map(function (v, i) { var q = S(v); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('') + 'Z" fill="none" stroke="' + c.axis + '" stroke-width="1.5"/>';
    var T = [P, Pp, A].map(S);
    s += '<path d="M' + T.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'Z" fill="' + c.goldSoft + '" stroke="none"/>';
    s += seg(P, V[2], c.muted, 1.5, true) + seg(Pp, V[2], c.muted, 1.5, true);
    s += seg(P, V[1], c.blue, 2, true) + seg(Pp, A, c.blue, 3) + seg(P, A, c.red, 3) + seg(P, Pp, c.green, 3);
    s += seg([0, 0], P, c.purple, 1.5, true);
    [[V[0], 'A'], [V[1], 'B'], [V[2], 'C']].forEach(function (v) { var q = S(v[0]); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="4" fill="' + c.ink + '"/>'; });
    var q = S(Pp); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="5" fill="' + c.gold + '"/>';
    q = S(P); s += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="9" fill="' + c.purple + '" stroke="' + c.panel + '" stroke-width="2" style="cursor:grab"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + c.ink + '"/>';
    svg.innerHTML = s;
    var a = dist(P, A), b = dist(P, V[1]), cc = dist(P, V[2]), d = M.hypot(P[0], P[1]);
    var sp = (a + b + cc) / 2, K = M.sqrt(M.max(0, sp * (sp - a) * (sp - b) * (sp - cc)));
    [['A', V[0], 18, 0], ['B', V[1], -14, -14], ['C', V[2], -14, 14]].forEach(function (z) { var p = S(z[1]); L('v' + z[0], p[0] + z[2], p[1] + z[3], z[0], c.ink, 1); });
    var pp = S(P); L('P', pp[0], pp[1] - 18, 'P', c.purple, 1);
    var pq = S(Pp); L('Q', pq[0] + 16, pq[1], "P'", c.gold, 1);
    L('a', 335, 36, '\\color{red}{a = PA = ' + a.toFixed(3) + '}', c.ink);
    L('b', 335, 66, '\\color{blue}{b = PB = P\'A = ' + b.toFixed(3) + '}', c.ink);
    L('c', 335, 96, '\\color{green}{c = PC = PP\' = ' + cc.toFixed(3) + '}', c.ink);
    L('d', 335, 140, '\\text{Heron: area} = ' + K.toFixed(4), c.ink);
    L('e', 335, 180, '\\tfrac{\\sqrt3}{4}\\left(1 - OP^2\\right) = ' + (M.sqrt(3) / 4 * (1 - d * d)).toFixed(4), c.gold);
    L('f', 335, 220, 'OP = ' + d.toFixed(3), c.purple);
    cap.textContent = 'Drag P. Triangle CPP′ is equilateral, so PP′ = c, and the rotation carries B to A, so P′A = b.';
  }
  function setFrom(ev) {
    var r = svg.getBoundingClientRect(), x = ((ev.clientX - r.left) / r.width * W - cx) / u, y = -((ev.clientY - r.top) / r.height * H - cy) / u, m = M.hypot(x, y);
    if (m > 0.97) { x *= 0.97 / m; y *= 0.97 / m; }
    P = [x, y]; draw();
  }
  var drag = false;
  svg.addEventListener('pointerdown', function (ev) { drag = true; stop(); setFrom(ev); try { svg.setPointerCapture(ev.pointerId); } catch (e) { } });
  svg.addEventListener('pointermove', function (ev) { if (drag) setFrom(ev); });
  svg.addEventListener('pointerup', function () { drag = false; });
  svg.addEventListener('pointercancel', function () { drag = false; });
  function btn(t, fn) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', fn); bar.appendChild(b); return b; }
  var timer = 0, pb;
  function stop() { clearInterval(timer); timer = 0; if (pb) pb.textContent = 'Circle around O'; }
  pb = btn('Circle around O', function () {
    if (timer) return stop();
    var r = M.max(0.15, M.hypot(P[0], P[1])); ang = M.atan2(P[1], P[0]);
    pb.textContent = 'Pause';
    timer = setInterval(function () { if (!el.isConnected) return stop(); ang += 0.04; P = [r * M.cos(ang), r * M.sin(ang)]; draw(); }, 40);
  });
  btn('P at O', function () { stop(); P = [0, 0]; draw(); });
  api.onTheme(draw); draw();
};
