/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2023-a3. */
(window.CompViz = window.CompViz || {})['putnam-2023-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 300; var x = 0, XM = M.PI;
  V.aria = 'Two admissible examples. The angle of the point (f, v), where v is the running integral of f, is plotted against x. It never rises faster than the line of slope 1, so it cannot reach a right angle before x equals pi over 2.';
  function th1(t) { return M.min(t, M.PI / 2); }
  function th2(t) { return M.atan2(2 * M.sin(t / 2), M.cos(t / 2)); }
  V.reset = function () { x = 0; };
  V.advance = function (dt) { x += dt * 0.45; if (x >= XM) { x = XM; return false; } };
  V.done = function () { return x >= XM; };
  V.step = function () { x = M.min(XM, x + 0.2); };
  V.final = function () { x = 2.2; };
  V.draw = function (c, L) {
    var x0 = 60, y0 = 30, w = 330, h = 220, s = '', i, T = M.PI, A = M.PI / 2 * 1.15;
    function X(t) { return x0 + t / T * w; } function Y(a) { return y0 + h - a / A * h; }
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
    s += ln(x0, Y(M.PI / 2), x0 + w, Y(M.PI / 2), c.gold, 1.5, '6 4') + ln(X(M.PI / 2), y0, X(M.PI / 2), y0 + h, c.grid, 1, '3 4');
    s += ln(X(0), Y(0), X(M.PI / 2 * 1.15), Y(M.PI / 2 * 1.15), c.muted, 1.5, '2 4');
    var p1 = [], p2 = [];
    for (i = 0; i <= 80; i++) { var t = x * i / 80; p1.push([X(t), Y(th1(t))]); p2.push([X(t), Y(th2(t))]); }
    s += pa(poly(p1), c.blue, 3) + pa(poly(p2), c.green, 3);
    s += ci(X(x), Y(th1(x)), 5, c.blue) + ci(X(x), Y(th2(x)), 5, c.green);
    s += tx(X(M.PI / 2), y0 + h + 22, 'π/2', c.muted, 15) + tx(X(M.PI), y0 + h + 22, 'π', c.muted, 15);
    L('q', x0 + 6, Y(M.PI / 2) - 12, '\\theta=\\tfrac{\\pi}{2}\\ (f=0)', c.gold, 'l');
    L('r', 395, 50, "\\theta'=\\dfrac{f^2-vf'}{f^2+v^2}\\le1", c.ink, 'l');
    L('a', 395, 120, 'f=\\cos x,\\ g=\\sin x', c.blue, 'l');
    L('b', 395, 160, 'f=\\cos\\tfrac x2,\\ g=\\tfrac12\\sin\\tfrac x2', c.green, 'l');
    L('x', 395, 220, 'x=' + x.toFixed(2), c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'The angle of the point (f, v) with v = ∫f. Neither curve ever rises faster than the dotted line of slope 1, so the angle needs x ≥ π/2 to reach the gold level where f first vanishes.'; };
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
