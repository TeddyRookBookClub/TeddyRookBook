/* Our own visualization for the Teddy Rook Book Schweitzer selection: schw-2014-p8. */
(window.CompViz = window.CompViz || {})['schw-2014-p8'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300 };
  V.aria = 'The error of the best approximation of x to the n on [0,1] by lower-degree polynomials: a scaled Chebyshev polynomial that touches plus and minus its maximum n+1 times, at the nodes used in the solution.';
  var n = 3;
  function T(k, t) { return M.cos(k * M.acos(M.max(-1, M.min(1, t)))); }
  V.buttons = [['n − 1', function () { n = M.max(1, n - 1); }], ['n + 1', function () { n = M.min(7, n + 1); }]];
  V.draw = function (c, L) {
    var X0 = 50, X1 = 600, Y0 = 160, A = 100, s = '', p = [];
    function P(x, y) { return [X0 + x * (X1 - X0), Y0 - y * A]; }
    s += ln(X0, Y0, X1, Y0, c.axis, 1.5) + ln(X0, Y0 - A, X1, Y0 - A, c.muted, 1, '5 5') + ln(X0, Y0 + A, X1, Y0 + A, c.muted, 1, '5 5');
    for (var i = 0; i <= 300; i++) { var x = i / 300; p.push(P(x, T(n, 2 * x - 1))); }
    s += pa(poly(p), c.blue, 2.5);
    for (var j = 0; j <= n; j++) { var t = (1 - M.cos(j * M.PI / n)) / 2, q = P(t, (n - j) % 2 ? -1 : 1); s += ci(q[0], q[1], 5.5, c.gold, c.ink, 1); }
    L('a', X0 - 8, Y0 + A + 22, '0', c.muted); L('b', X1, Y0 + A + 22, '1', c.muted);
    L('e', X1, Y0 - A - 16, '+E', c.muted, 'r'); L('f', 16, 22, 'x^{' + n + '} - p_0(x),\\quad E = 2^{1-2n} = 1/' + M.pow(2, 2 * n - 1), c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'n = ' + n + ': the error curve, drawn to scale 1/E, reaches its extremes at ' + (n + 1) + ' gold nodes with alternating signs; no polynomial of lower degree can do better.'; };
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
