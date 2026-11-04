/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2010-a1. */
(window.CompViz = window.CompViz || {})['putnam-2010-a1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 310; var n = 9;
  V.aria = 'The numbers 1 to n packed into boxes with equal sums. For even n each box pairs j with n plus 1 minus j; for odd n the number n sits alone and the others pair up to n. The number of boxes is the ceiling of n over 2.';
  V.reset = function () { };
  function boxes() { var b = [], j; if (n % 2) { b.push([n]); for (j = 1; j < n - j; j++) b.push([j, n - j]); } else for (j = 1; j <= n / 2; j++) b.push([j, n + 1 - j]); return b; }
  V.draw = function (c, L) {
    var s = '', b = boxes(), k = b.length, bw = M.min(56, 600 / k - 6), x0 = 320 - (k * (bw + 6)) / 2, base = 260, uh = 190 / (n + 1), i;
    var cols = [c.green, c.blue, c.gold, c.purple, c.teal, c.orange];
    b.forEach(function (bx, t) {
      var x = x0 + t * (bw + 6), y = base;
      bx.forEach(function (v, r) { var hh = v * uh; y -= hh; s += '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(bw) + '" height="' + f1(hh - 2) + '" rx="3" fill="' + c[['greenSoft', 'blueSoft'][r]] + '" stroke="' + cols[r] + '"/>' + (hh > 16 ? tx(x + bw / 2, y + hh / 2 + 5, v, c.ink, 14) : ''); });
      s += tx(x + bw / 2, y - 8, bx.reduce(function (p, q) { return p + q; }, 0), c.muted, 13);
    });
    s += ln(20, base, 620, base, c.axis, 1.5);
    L('a', 30, 30, 'n=' + n + ':\\ ' + k + '\\text{ boxes}', c.ink, 'l');
    L('b', 610, 30, '\\text{sum}\\ge n\\ \\Rightarrow\\ k\\le\\tfrac{n+1}{2}', c.gold, 'r');
    L('c', 320, 290, k + '=\\lceil ' + n + '/2\\rceil', c.green, 'm');
    return s;
  };
  V.cap = function () { return n % 2 ? 'n is odd: the box {n} plus pairs adding up to n.' : 'n is even: pairs adding up to n + 1.'; };
  V.buttons = [6, 7, 8, 9, 10, 11, 12].map(function (m) { return ['n = ' + m, function () { n = m; }]; });
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
