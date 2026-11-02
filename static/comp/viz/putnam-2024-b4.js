/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2024-b4. */
(window.CompViz = window.CompViz || {})['putnam-2024-b4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 340; var n = 80, paths = [], cnt = 0, acc = 0;
  V.aria = 'Sample paths of the walk divided by n, for n equal to 80, together with the expected value curve. The expected value at the end is close to (1 minus e to the minus 2) over 2.';
  function walk() { var a = 1, p = [a]; for (var k = 0; k < n; k++) { var m = 1 + M.floor(M.random() * n); a += m > a ? 1 : m < a ? -1 : 0; p.push(a); } return p; }
  function E(k) { return (n + 1) / 2 + M.pow(1 - 2 / n, k) * (1 - n) / 2; }
  V.reset = function () { paths = []; cnt = 0; acc = 0; };
  V.advance = function (dt) { acc += dt; if (acc > 0.25) { acc = 0; paths.push(walk()); cnt++; if (paths.length > 30) paths.shift(); } if (cnt >= 60) return false; };
  V.done = function () { return cnt >= 60; };
  V.step = function () { paths.push(walk()); cnt++; if (paths.length > 30) paths.shift(); };
  V.final = function () { for (var i = 0; i < 20; i++) V.step(); };
  V.draw = function (c, L) {
    var x0 = 50, y0 = 30, w = 560, h = 210, s = '', i, k;
    function X(t) { return x0 + t / n * w; } function Y(a) { return y0 + h - a / n / 0.7 * h; }
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.5) + ln(x0, y0, x0, y0 + h, c.axis, 1.5);
    paths.forEach(function (p, j) { var q = []; for (k = 0; k <= n; k++) q.push([X(k), Y(p[k])]); s += '<g opacity="' + (0.25 + 0.6 * (j + 1) / paths.length).toFixed(2) + '">' + pa(poly(q), c.blue, 1) + '</g>'; });
    var q = []; for (k = 0; k <= n; k++) q.push([X(k), Y(E(k))]); s += pa(poly(q), c.orange, 3);
    var yl = y0 + h - (1 - M.exp(-2)) / 2 / 0.7 * h; s += ln(x0, yl, x0 + w, yl, c.gold, 1.5, '6 4');
    s += tx(x0 + w, y0 + h + 22, 'k = n', c.muted, 15, 'end') + tx(x0, y0 + h + 22, '0', c.muted, 15);
    L('r', 20, 290, 'E[a_{k+1}]=\\big(1-\\tfrac2n\\big)E[a_k]+\\tfrac{n+1}{n}', c.ink, 'l');
    L('l', 20, 324, '\\tfrac{E(n)}{n}\\to\\tfrac{1-e^{-2}}{2}\\approx0.4323', c.gold, 'l');
    L('v', x0 + w, y0 + 12, '\\tfrac{E(80)}{80}=' + (E(n) / n).toFixed(4), c.orange, 'r');
    return s;
  };
  V.cap = function () { return 'Blue: ' + paths.length + ' sample walks with n = 80, scaled by 1/n. Orange: the exact expected value from the linear recursion.'; };
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
