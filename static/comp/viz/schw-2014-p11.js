/* Our own visualization for the Teddy Rook Book Schweitzer selection: schw-2014-p11. */
(window.CompViz = window.CompViz || {})['schw-2014-p11'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300 };
  V.aria = 'A histogram of the random sine sum for a chosen n, from 20,000 random draws, with the Cauchy density curve on top.';
  var ns = [1, 2, 5, 20, 100], ni = 2, h = [], N = 20000, B = 48, R = 6;
  function fresh() {
    h = []; for (var b = 0; b < B; b++) h.push(0);
    var n = ns[ni];
    for (var i = 0; i < N; i++) { var u = M.random(), x = (M.cos(M.PI * u) - M.cos((2 * n + 1) * M.PI * u)) / M.sin(M.PI * u), b = M.floor((x + R) / (2 * R) * B); if (b >= 0 && b < B) h[b]++; }
  }
  fresh();
  V.buttons = [['Larger n', function () { ni = (ni + 1) % ns.length; fresh(); }], ['New sample', fresh]];
  V.draw = function (c, L) {
    var X0 = 40, X1 = 600, Y0 = 270, S = 600, s = '', w = (X1 - X0) / B, dx = 2 * R / B;
    s += ln(X0, Y0, X1, Y0, c.axis, 1.5);
    for (var b = 0; b < B; b++) { var y = h[b] / N / dx * S; s += '<rect x="' + f1(X0 + b * w + 1) + '" y="' + f1(Y0 - y) + '" width="' + f1(w - 2) + '" height="' + f1(y) + '" fill="' + c.blue + '" fill-opacity="0.55"/>'; }
    var p = []; for (var i = 0; i <= 240; i++) { var x = -R + 2 * R * i / 240; p.push([X0 + (x + R) / (2 * R) * (X1 - X0), Y0 - S / (M.PI * (1 + x * x))]); }
    s += pa(poly(p), c.red, 2.5);
    [-6, -3, 0, 3, 6].forEach(function (t) { L('x' + t, X0 + (t + R) / (2 * R) * (X1 - X0), Y0 + 16, String(t), c.muted); });
    L('f', 16, 24, 'S_n=\\frac{\\cos \\pi U-\\cos (2n+1)\\pi U}{\\sin \\pi U}', c.ink, 'l');
    L('g', 624, 24, '\\frac{1}{\\pi(1+x^2)}', c.red, 'r');
    L('n', 624, 60, 'n=' + ns[ni], c.blue, 'r');
    return s;
  };
  V.cap = function () { return 'n = ' + ns[ni] + ': 20,000 draws of the sine sum (blue bars) against the Cauchy density (red curve).'; };
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
