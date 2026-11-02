/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2025-b2. */
(window.CompViz = window.CompViz || {})['putnam-2025-b2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var fi = 0, FS = [['x^2+0.1', function (x) { return x * x + 0.1; }], ['e^{3x}/20', function (x) { return M.exp(3 * x) / 20; }], ['x^{0.3}', function (x) { return M.pow(x, 0.3); }]];
  V.aria = 'An increasing curve over the unit interval with the region under it shaded and the outline of the solid made by spinning it. Markers show the centroid of the region and the centroid of the solid; the second is always further right.';
  function cent() { var f = FS[fi][1], a = 0, b = 0, c2 = 0, d = 0, N = 400; for (var i = 0; i < N; i++) { var x = (i + .5) / N, y = f(x); a += x * y; b += y; c2 += x * y * y; d += y * y; } return [a / b, c2 / d]; }
  V.step = function () { fi = (fi + 1) % FS.length; };
  V.final = function () { fi = 0; };
  V.draw = function (c, L) {
    var f = FS[fi][1], x0 = 46, w = 320, cy = 160, mx = 0, i, s = '';
    for (i = 0; i <= 50; i++) mx = M.max(mx, f(i / 50));
    var S = 120 / mx, up = [], dn = [];
    for (i = 0; i <= 80; i++) { var x = i / 80; up.push([x0 + x * w, cy - f(x) * S]); dn.push([x0 + x * w, cy + f(x) * S]); }
    s += pa(poly(up) + 'L' + (x0 + w) + ' ' + cy + 'L' + x0 + ' ' + cy + 'Z', null, 0, c.green, '', 0.35);
    s += pa(poly(up), c.green, 2.5) + pa(poly(dn), c.muted, 1.5, null, '5 4');
    [0.25, 0.5, 0.75, 1].forEach(function (x) { var X = x0 + x * w, r = f(x) * S; s += '<ellipse cx="' + X + '" cy="' + cy + '" rx="' + f1(r * 0.25) + '" ry="' + f1(r) + '" fill="none" stroke="' + c.muted + '" stroke-width="1"/>'; });
    s += ln(x0 - 10, cy, x0 + w + 15, cy, c.axis, 1.5);
    var k = cent(), X1 = x0 + k[0] * w, X2 = x0 + k[1] * w;
    s += ln(X1, cy - 150, X1, cy + 140, c.blue, 2, '6 4') + ln(X2, cy - 150, X2, cy + 140, c.orange, 2, '6 4');
    s += ci(X1, cy, 6, c.blue) + ci(X2, cy, 6, c.orange);
    L('f', 432, 40, 'f(x)=' + FS[fi][0], c.green, 'l');
    L('a', 432, 100, 'x_1=\\dfrac{\\int xf}{\\int f}=' + k[0].toFixed(3), c.blue, 'l');
    L('b', 432, 170, 'x_2=\\dfrac{\\int xf^2}{\\int f^2}=' + k[1].toFixed(3), c.orange, 'l');
    L('c', 432, 240, 'x_1<x_2', c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Step switches the function. The solid weights each slice by f², which favors the tall right end, so its centroid sits further right.'; };
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + '/>'; }
  function pa(d, k, w, f, da, op) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + (op ? ' fill-opacity="' + op + '"' : '') + ' stroke-linejoin="round"/>'; }
  function tx(x, y, s, k, sz, an) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '" font-family="system-ui,sans-serif">' + s + '</text>'; }
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
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  var playing = false, last = 0;
  function render() {
    var c = api.colors(); lbg = c.panel + 'd9'; seen = {};
    svg.innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + V.H + '" fill="' + c.panel + '"/>' + V.draw(c, L);
    for (var k in labs) if (!seen[k]) L(k, 0, 0, '');
    cap.textContent = V.cap ? V.cap() : '';
  }
  function frame(ts) {
    if (!playing) return;
    if (!el.isConnected) { playing = false; return; }
    var dt = last ? M.min(0.1, (ts - last) / 1000) : 0; last = ts;
    if (V.advance(dt) === false) stop();
    if (el.offsetParent !== null) render();
    if (playing) requestAnimationFrame(frame);
  }
  function play() { if (playing) return; if (V.done && V.done()) V.reset(); playing = true; last = 0; pb.textContent = 'Pause'; requestAnimationFrame(frame); }
  function stop() { playing = false; if (pb) pb.textContent = 'Play'; }
  var pb = V.advance ? btn('Play', function () { if (playing) stop(); else play(); }) : null;
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
