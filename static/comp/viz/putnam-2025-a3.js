/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2025-a3. */
(window.CompViz = window.CompViz || {})['putnam-2025-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 330; var path = [], acc = 0, over = false;
  V.aria = 'The nine strings of two digits drawn as a 3 by 3 grid. Dominoes pair every string except 00 with a neighbor. In a sample game Alice moves at random and Bob always moves to the partner, until Alice is stuck.';
  function key(p) { return p[0] + '' + p[1]; }
  function mate(p) { if (p[0] === 0) return p[1] === 1 ? [0, 2] : p[1] === 2 ? [0, 1] : null; return [3 - p[0], p[1]]; }
  function nbrs(p) { var o = [], d = [[1, 0], [-1, 0], [0, 1], [0, -1]]; d.forEach(function (e) { var q = [p[0] + e[0], p[1] + e[1]]; if (q[0] >= 0 && q[0] <= 2 && q[1] >= 0 && q[1] <= 2) o.push(q); }); return o; }
  function seenK(q) { return path.some(function (r) { return key(r) === key(q); }); }
  function move() {
    if (over) return;
    var cur = path[path.length - 1], alice = path.length % 2 === 1;
    if (alice) { var opts = nbrs(cur).filter(function (q) { return !seenK(q); }); if (!opts.length) { over = true; return; } path.push(opts[M.floor(M.random() * opts.length)]); }
    else path.push(mate(cur));
  }
  V.reset = function () { path = [[0, 0]]; over = false; acc = 0; };
  V.advance = function (dt) { acc += dt; if (acc > 0.9) { acc = 0; move(); } if (over) return false; };
  V.done = function () { return over; };
  V.step = function () { if (over) V.reset(); else move(); };
  V.final = function () { while (!over) move(); };
  V.draw = function (c, L) {
    var ox = 70, oy = 50, G = 95, s = '', i, j;
    function P(p) { return [ox + p[1] * G, oy + (2 - p[0]) * G]; }
    var pairs = [[[1, 0], [2, 0]], [[1, 1], [2, 1]], [[1, 2], [2, 2]], [[0, 1], [0, 2]]];
    pairs.forEach(function (q) { var a = P(q[0]), b = P(q[1]), x = M.min(a[0], b[0]) - 26, y = M.min(a[1], b[1]) - 26; s += '<rect x="' + x + '" y="' + y + '" width="' + (M.abs(a[0] - b[0]) + 52) + '" height="' + (M.abs(a[1] - b[1]) + 52) + '" rx="22" fill="' + c.gold + '" opacity="0.28"/>'; });
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) { if (j < 2) s += ln(ox + j * G, oy + i * G, ox + (j + 1) * G, oy + i * G, c.grid, 1.5); if (i < 2) s += ln(ox + j * G, oy + i * G, ox + j * G, oy + (i + 1) * G, c.grid, 1.5); }
    for (i = 1; i < path.length; i++) { var a = P(path[i - 1]), b = P(path[i]); s += ln(a[0], a[1], b[0], b[1], i % 2 ? c.blue : c.orange, 5); }
    for (i = 0; i < 3; i++) for (j = 0; j < 3; j++) { var q = P([i, j]), on = seenK([i, j]); s += ci(q[0], q[1], 19, on ? c.bg : c.panel, c.ink, 2) + tx(q[0], q[1] + 6, '' + i + j, c.ink, 17); }
    L('a', 390, 70, '\\color{blue}{\\text{Alice}}\\ \\text{moves, then}\\ \\color{orange}{\\text{Bob}}', c.ink, 'l');
    L('b', 390, 110, '\\text{Bob: go to the partner}', c.ink, 'l');
    L('c', 390, 150, '\\text{(gold domino)}', c.gold, 'l');
    L('d', 390, 210, over ? '\\text{Alice is stuck: Bob wins}' : '\\text{moves so far: }' + (path.length - 1), over ? c.green : c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Strings with first digit as the row (0 at the bottom) and second digit as the column. Every string except 00 has a domino partner, so Bob always has a fresh reply.'; };
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
