/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2013-b2. */
(window.CompViz = window.CompViz || {})['putnam-2013-b2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320;
  V.aria = 'Graph of f of x equals 1 plus four thirds cosine 2 pi x plus two thirds cosine 4 pi x on one period. It never dips below zero, touches zero at x equals one third and two thirds, and equals 3 at x equals 0.';
  V.reset = function () { };
  function f(x) { return 1 + 4 / 3 * M.cos(2 * M.PI * x) + 2 / 3 * M.cos(4 * M.PI * x); }
  V.draw = function (c, L) {
    var s = '', ox = 40, oy = 280, w = 300, h = 80, i;
    function X(x) { return ox + x * w; } function Y(y) { return oy - y * h; }
    s += ln(ox, oy, ox + w + 8, oy, c.axis, 1.5) + ln(ox, oy, ox, Y(3.3), c.axis, 1.5);
    for (i = 1; i <= 3; i++) s += ln(ox - 4, Y(i), ox + w, Y(i), c.grid, 1, '3 4') + tx(ox - 14, Y(i) + 5, i, c.muted, 13);
    var q = []; for (i = 0; i <= 300; i++) q.push([X(i / 300), Y(f(i / 300))]); s += pa(poly(q), c.green, 3);
    [[0, 3], [1 / 3, 0], [2 / 3, 0]].forEach(function (p) { s += ci(X(p[0]), Y(p[1]), 6, c.gold); });
    s += tx(X(0), oy + 20, '0', c.muted, 13) + tx(X(1 / 3), oy + 20, '1/3', c.muted, 13) + tx(X(2 / 3), oy + 20, '2/3', c.muted, 13) + tx(X(1), oy + 20, '1', c.muted, 13);
    L('a', 370, 50, 'f(0)+f(\\tfrac13)+f(\\tfrac23)=3', c.gold, 'l');
    L('b', 370, 95, '\\text{(terms with } 3\\nmid n \\text{ cancel)}', c.muted, 'l');
    L('c', 370, 150, 'f\\ge0\\ \\Rightarrow\\ f(0)\\le3', c.ink, 'l');
    L('d', 370, 215, 'f=\\tfrac13\\big|1+e^{i\\theta}+e^{2i\\theta}\\big|^2', c.green, 'l');
    L('e', 370, 260, '=1+\\tfrac43\\cos\\theta+\\tfrac23\\cos2\\theta', c.green, 'l');
    return s;
  };
  V.cap = function () { return 'The extremal f is a squared sum of three roots of unity: it vanishes at 1/3 and 2/3, so all of the 3 sits at x = 0.'; };
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
