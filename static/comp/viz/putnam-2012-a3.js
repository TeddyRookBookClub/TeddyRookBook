/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2012-a3. */
(window.CompViz = window.CompViz || {})['putnam-2012-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var k = 0, x0 = 0.97;
  V.aria = 'The graph of phi of x equals x squared over 2 minus x squared on the unit interval together with the line y equals x. A staircase starting at x equals 0.97 shows the iterates of phi sliding down to 0; the ratio g of f over the square root of 1 minus x squared stays the same along the way.';
  function phi(x) { return x * x / (2 - x * x); }
  V.reset = function () { k = 0; };
  V.step = function () { if (k < 8) k++; };
  var acc = 0;
  V.advance = function (dt) { acc += dt; if (acc > 0.8) { acc = 0; V.step(); } if (k >= 8) return false; };
  V.done = function () { return k >= 8; };
  V.final = function () { k = 8; };
  V.draw = function (c, L) {
    var s = '', ox = 40, oy = 305, w = 280, i;
    function X(x) { return ox + x * w; } function Y(y) { return oy - y * w; }
    s += ln(ox, oy, ox + w + 8, oy, c.axis, 1.5) + ln(ox, oy, ox, oy - w - 8, c.axis, 1.5) + ln(X(0), Y(0), X(1), Y(1), c.muted, 1.5, '5 4');
    var q = []; for (i = 0; i <= 100; i++) q.push([X(i / 100), Y(phi(i / 100))]); s += pa(poly(q), c.green, 3);
    var x = x0, st = [[X(x), Y(0)]];
    for (i = 0; i < k; i++) { var y = phi(x); st.push([X(x), Y(y)]); st.push([X(y), Y(y)]); x = y; }
    if (k) s += pa(poly(st), c.gold, 2);
    s += ci(X(x), Y(0), 5, c.red) + tx(ox, oy + 20, '0', c.muted, 14) + tx(X(1), oy + 20, '1', c.muted, 14);
    L('a', 360, 50, '\\varphi(x)=\\frac{x^2}{2-x^2}', c.green, 'l');
    L('b', 360, 105, 'g(x)=\\frac{f(x)}{\\sqrt{1-x^2}}=g(\\varphi(x))', c.ink, 'l');
    L('c', 360, 160, 'x_{' + k + '}=' + (x < 1e-4 ? x.toExponential(1).replace(/e([+-]\d+)/, function (m, e) { return '\\times10^{' + (+e) + '}'; }) : x.toFixed(4)), c.red, 'l');
    L('d', 360, 215, 'x_k\\to0\\ \\Rightarrow\\ g(x)=g(0)=1', c.gold, 'l');
    L('e', 360, 265, 'f(x)=\\sqrt{1-x^2}', c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Starting at x = 0.97, each step applies φ. The values fall to 0 quickly, and g is the same at every step.'; };
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
