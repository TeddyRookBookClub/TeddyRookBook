/* Our own visualization for the Teddy Rook Book Schweitzer selection: schw-2023-p11. */
(window.CompViz = window.CompViz || {})['schw-2023-p11'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 330 };
  V.aria = 'An equilateral triangle with random points inside. The smallest upright copy of the triangle that holds the points is shaded; its size is set by the three smallest barycentric coordinates.';
  var A = [320, 28], B = [150, 312], C = [490, 312], ns = [2, 3, 5, 10, 30], ni = 0, pts = [], m = [0, 0, 0];
  function bp(l) { return [l[0] * A[0] + l[1] * B[0] + l[2] * C[0], l[0] * A[1] + l[1] * B[1] + l[2] * C[1]]; }
  function fresh() {
    pts = []; m = [1, 1, 1];
    for (var i = 0; i < ns[ni]; i++) { var u = M.random(), v = M.random(); if (u > v) { var t = u; u = v; v = t; } var l = [u, v - u, 1 - v]; pts.push(l); for (var k = 0; k < 3; k++) m[k] = M.min(m[k], l[k]); }
  }
  fresh();
  V.buttons = [['New points', fresh], ['More points', function () { ni = (ni + 1) % ns.length; fresh(); }]];
  V.draw = function (c, L) {
    var s = pa(poly([A, B, C], 1), c.axis, 2, c.greenSoft || 'none');
    var K = [bp([1 - m[1] - m[2], m[1], m[2]]), bp([m[0], 1 - m[0] - m[2], m[2]]), bp([m[0], m[1], 1 - m[0] - m[1]])];
    s += pa(poly(K, 1), c.green, 2.5, c.gold, 0.35);
    pts.forEach(function (l) { var p = bp(l); s += ci(p[0], p[1], 4.5, c.blue, c.ink, 1); });
    var n = ns[ni], ex = (2 * n - 1) * (n - 1) / ((2 * n + 1) * (n + 1)), ar = M.pow(1 - m[0] - m[1] - m[2], 2);
    L('f', 16, 30, '\\text{area} = (1-m_1-m_2-m_3)^2', c.ink, 'l');
    L('g', 16, 62, '= ' + ar.toFixed(3), c.green, 'l');
    L('h', 624, 30, '\\mathbb{E} = \\frac{(2n-1)(n-1)}{(2n+1)(n+1)}', c.ink, 'r');
    L('i', 624, 68, 'n=' + n + ':\\ ' + ex.toFixed(3), c.muted, 'r');
    return s;
  };
  V.cap = function () { return ns[ni] + ' random points. The gold triangle is the intersection of all translates of the big triangle that contain them; its area is ' + M.pow(1 - m[0] - m[1] - m[2], 2).toFixed(3) + ' of the whole.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (op ? ' fill-opacity="' + op + '"' : '') + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + ' stroke-linejoin="round"/>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  el.innerHTML = '';
  var box = D.createElement('div'); box.style.cssText = 'position:relative;max-width:640px;margin:0 auto';
  var svg = D.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + V.H); svg.setAttribute('width', '100%');
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', V.aria); svg.style.display = 'block'; svg.style.borderRadius = '8px';
  var lay = D.createElement('div'); lay.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;overflow:hidden';
  box.appendChild(svg); box.appendChild(lay); el.appendChild(box);
  var bar = D.createElement('div'); bar.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px'; el.appendChild(bar);
  var cap = D.createElement('p'); cap.style.cssText = 'margin:.4em 0 0;font-size:.92em'; cap.setAttribute('aria-live', 'polite'); el.appendChild(cap);
  var labs = {}, lbg = 'transparent', seen = {};
  function L(key, x, y, s, col, an) {
    seen[key] = 1;
    var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.4vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap();
  }
  (V.buttons || []).forEach(function (b) { var e = D.createElement('button'); e.type = 'button'; e.className = 'cp-btn'; e.textContent = b[0]; e.addEventListener('click', function () { b[1](); render(); }); bar.appendChild(e); });
  api.onTheme(render);
  render();
};
