/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2013-a6. */
(window.CompViz = window.CompViz || {})['putnam-2013-a6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330;
  V.aria = 'A heat map of the Fourier series of the weight table over the square from minus pi to pi in both directions. It is never negative; it is zero only at a few marked points, such as the center.';
  V.reset = function () { };
  function wh(a, b) { var u = M.cos(a), v = M.cos(b); return 16 * ((u + v) * (u + v) - u * v * (1 + u) * (1 + v)); }
  V.draw = function (c, L) {
    var s = '', n = 32, G = 260, sz = G / n, ox = 16, oy = 30, i, j;
    var lo = c.panel, hi = c.green;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var a = -M.PI + (i + 0.5) * 2 * M.PI / n, b = -M.PI + (j + 0.5) * 2 * M.PI / n, t = M.pow(wh(a, b) / 64, 0.6);
      s += '<rect x="' + f1(ox + i * sz) + '" y="' + f1(oy + (n - 1 - j) * sz) + '" width="' + f1(sz + 0.6) + '" height="' + f1(sz + 0.6) + '" fill="' + hi + '" fill-opacity="' + t.toFixed(3) + '"/>';
    }
    s += '<rect x="' + ox + '" y="' + oy + '" width="' + G + '" height="' + G + '" fill="none" stroke="' + c.axis + '"/>';
    [[0, 0], [M.PI, M.PI], [M.PI / 2, M.PI / 2], [0, M.PI], [M.PI, 0]].forEach(function (p) {
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (sg) { var a = p[0] * sg[0], b = p[1] * sg[1]; if (wh(a, b) < 1e-9) s += ci(ox + (a + M.PI) / (2 * M.PI) * G, oy + G - (b + M.PI) / (2 * M.PI) * G, 4, c.red); });
    });
    s += tx(ox, oy + G + 18, '−π', c.muted, 13) + tx(ox + G, oy + G + 18, 'π', c.muted, 13);
    L('a', 300, 40, '\\hat w=\\sum_{c} w(c)\\,e^{-ic\\cdot\\theta}', c.ink, 'l');
    L('b', 300, 85, '=16\\,(u+v)^2', c.green, 'l');
    L('b2', 300, 120, '\\quad-16\\,uv(1+u)(1+v)', c.green, 'l');
    L('c', 300, 158, 'u=\\cos\\theta_1,\\ v=\\cos\\theta_2', c.muted, 'l');
    L('d', 300, 215, 'A(S)=\\tfrac{1}{4\\pi^2}\\iint \\hat w\\,|P|^2', c.ink, 'l');
    L('e', 300, 265, '\\hat w\\ge0;\\ \\text{zero at red dots}', c.red, 'l');
    return s;
  };
  V.cap = function () { return 'Darker green means a larger value of the transform; it never goes below 0, so A(S) is positive.'; };
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
