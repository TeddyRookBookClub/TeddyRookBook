/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2023-b3. */
(window.CompViz = window.CompViz || {})['putnam-2023-b3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 300; var n = 14, xs = [], runs = 0, tot = 0, acc = 0;
  V.aria = 'Random points in a row. Peaks and valleys are circled; the zigzag through the two ends and every turn is drawn. A running average of its length approaches (2n+2)/3.';
  function fresh() { xs = []; for (var i = 0; i < n; i++) xs.push(M.random()); runs++; tot += len(); }
  function turn(i) { return i > 0 && i < n - 1 && ((xs[i] - xs[i - 1]) * (xs[i + 1] - xs[i]) < 0); }
  function len() { var k = 2; for (var i = 1; i < n - 1; i++) if (turn(i)) k++; return k; }
  V.reset = function () { runs = 0; tot = 0; acc = 0; fresh(); };
  V.advance = function (dt) { acc += dt; if (acc > (runs < 8 ? 0.9 : 0.05)) { acc = 0; fresh(); } if (runs > 3000) return false; };
  V.done = function () { return runs > 3000; };
  V.step = function () { fresh(); };
  V.final = function () { for (var i = 0; i < 1500; i++) fresh(); };
  V.draw = function (c, L) {
    var x0 = 40, y0 = 40, w = 560, h = 170, s = '', i, P = [], Z = [];
    for (i = 0; i < n; i++) { var px = x0 + i / (n - 1) * w, py = y0 + h - xs[i] * h; P.push([px, py]); if (i === 0 || i === n - 1 || turn(i)) Z.push([px, py]); }
    s += ln(x0, y0 + h, x0 + w, y0 + h, c.axis, 1.2);
    s += pa(poly(P), c.grid, 1.5) + pa(poly(Z), c.orange, 3);
    for (i = 0; i < n; i++) { s += ci(P[i][0], P[i][1], 4, c.ink); if (turn(i)) s += ci(P[i][0], P[i][1], 9, 'none', c.orange, 2); }
    L('a', x0, 250, '\\text{this zigzag: }' + len() + '\\qquad\\text{average over ' + runs + ' runs: }' + (tot / runs).toFixed(3), c.ink, 'l');
    L('b', x0, 280, '\\tfrac{2n+2}{3}=' + ((2 * n + 2) / 3).toFixed(3) + '\\ \\ (n=' + n + ')', c.gold, 'l');
    return s;
  };
  V.cap = function () { return 'Orange: start, end and every peak or valley. Each middle point is a turn with probability 2/3.'; };
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
