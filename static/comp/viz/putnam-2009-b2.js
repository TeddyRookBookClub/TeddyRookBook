/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2009-b2. */
(window.CompViz = window.CompViz || {})['putnam-2009-b2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var pts;
  V.aria = 'The parabola y equals x squared on the interval from 0 to 1, with a rectangle over each jump whose height is the square of the right endpoint. The total area of the rectangles is the cost of the trip, always more than one third and at most 1.';
  function eq(k) { pts = [0]; for (var i = 1; i <= k; i++) pts.push(i / k); }
  V.reset = function () { eq(4); };
  function cost() { var t = 0; for (var i = 1; i < pts.length; i++) t += pts[i] * pts[i] * (pts[i] - pts[i - 1]); return t; }
  V.draw = function (c, L) {
    var s = '', x0 = 40, y0 = 300, w = 300, h = 260, i;
    function X(x) { return x0 + x * w; } function Y(y) { return y0 - y * h; }
    for (i = 1; i < pts.length; i++) s += '<rect x="' + f1(X(pts[i - 1])) + '" y="' + f1(Y(pts[i] * pts[i])) + '" width="' + f1(X(pts[i]) - X(pts[i - 1])) + '" height="' + f1(pts[i] * pts[i] * h) + '" fill="' + c.goldSoft + '" stroke="' + c.gold + '" stroke-width="1.5"/>';
    var q = []; for (i = 0; i <= 100; i++) q.push([X(i / 100), Y(i * i / 1e4)]);
    s += pa(poly(q), c.green, 3);
    s += ln(x0, y0, x0 + w + 10, y0, c.axis, 1.5) + ln(x0, y0, x0, y0 - h - 10, c.axis, 1.5);
    s += tx(x0, y0 + 20, '0', c.muted, 14) + tx(X(1), y0 + 20, '1', c.muted, 14);
    L('a', 370, 60, 'C=\\sum b_i^2\\,(b_i-a_i)', c.gold, 'l');
    L('b', 370, 110, '\\int_0^1 x^2\\,dx=\\tfrac13', c.green, 'l');
    L('c', 370, 170, '\\text{jumps: } ' + (pts.length - 1), c.ink, 'l');
    L('d', 370, 210, 'C=' + cost().toFixed(4), c.ink, 'l');
    L('e', 370, 260, '\\tfrac13<C\\le1', c.muted, 'l');
    return s;
  };
  V.cap = function () { return 'Each gold rectangle is one jump: width b − a, height b². They always stick out above the curve, so the cost beats 1/3.'; };
  V.buttons = [['1 jump', function () { eq(1); }], ['2 jumps', function () { eq(2); }], ['5 jumps', function () { eq(5); }], ['20 jumps', function () { eq(20); }],
    ['Random trip', function () { var k = 2 + M.floor(M.random() * 7), a = [0, 1]; for (var i = 1; i < k; i++) a.push(M.random()); a.sort(function (u, v) { return u - v; }); pts = a; }]];
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
