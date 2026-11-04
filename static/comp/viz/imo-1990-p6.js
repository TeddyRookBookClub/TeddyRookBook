/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1990-p6. */
(window.CompViz = window.CompViz || {})['imo-1990-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'An equiangular polygon drawn side by side. Each side turns by the same angle, and the side lengths are the squares 1, 4, 9, and so on, placed by a rule based on splitting the side number into three remainders. The path closes up exactly.';
  var cases = [[2, 3, 5], [2, 3, 7], [2, 5, 7], [2, 5, 199]], ci0 = 0, sides = [], k = 0, acc = 0;
  function setup() {
    var f = cases[ci0], N = f[0] * f[1] * f[2], c = [0, 0, 0], a, b, d;
    for (a = 0; a < f[0]; a++) for (b = 0; b < f[1]; b++) for (d = 0; d < f[2]; d++) if ((a * N / f[0] + b * N / f[1] + d * N / f[2]) % N === 1) c = [a, b, d];
    sides = [];
    for (var j = 0; j < N; j++) { var x = (c[0] * j) % f[0], y = (c[1] * j) % f[1], z = (c[2] * j) % f[2], v = x * f[1] * f[2] + y * f[2] + z + 1; sides.push(v * v); }
    k = 0; acc = 0;
  }
  function path(m) { var N = sides.length, p = [[0, 0]], x = 0, y = 0; for (var j = 0; j < m; j++) { x += sides[j] * M.cos(2 * M.PI * j / N); y += sides[j] * M.sin(2 * M.PI * j / N); p.push([x, y]); } return p; }
  V.reset = function () { k = 0; acc = 0; };
  V.advance = function (dt) { var N = sides.length; acc += dt * N / 6; while (acc >= 1 && k < N) { acc -= 1; k++; } if (k >= N) return false; };
  V.done = function () { return k >= sides.length; };
  V.final = function () { k = sides.length; };
  V.step = function () { k = M.min(sides.length, k + M.max(1, M.round(sides.length / 10))); };
  V.buttons = [['Next N', function () { ci0 = (ci0 + 1) % cases.length; setup(); }]];
  V.draw = function (c, L) {
    var full = path(sides.length), x0 = 1e18, x1 = -1e18, y0 = 1e18, y1 = -1e18, s = '';
    full.forEach(function (p) { x0 = M.min(x0, p[0]); x1 = M.max(x1, p[0]); y0 = M.min(y0, p[1]); y1 = M.max(y1, p[1]); });
    var sc = M.min(560 / (x1 - x0), 330 / (y1 - y0)), ox = 320 - (x0 + x1) / 2 * sc, oy = 190 + (y0 + y1) / 2 * sc;
    function S(p) { return [ox + p[0] * sc, oy - p[1] * sc]; }
    s += pa(poly(full.map(S), 1), c.grid, 1.5);
    var pp = path(k).map(S);
    if (pp.length > 1) s += pa(poly(pp), c.blue, sides.length > 100 ? 1.8 : 2.5);
    var st = S([0, 0]); s += ci(st[0], st[1], 5, c.green);
    if (k > 0) { var e = pp[pp.length - 1]; s += ci(e[0], e[1], 4.5, k >= sides.length ? c.green : c.red); }
    var f = cases[ci0], N = sides.length, tail = full[N], gap = M.hypot(tail[0], tail[1]);
    L('n', 14, 392, 'N=' + f.join('\\cdot') + '=' + N + ',\\quad s_k=(' + f[1] * f[2] + 'a+' + f[2] + 'b+c+1)^2', c.ink, 'l');
    L('g', 626, 24, k >= N ? '\\text{the path closes}' : '\\text{side }' + k + '\\text{ of }' + N, k >= N ? c.green : c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'Every side turns by 360°/N from the one before. Side k gets the square of a number built from the three remainders (a, b, c) of k, and the polygon closes. The last case is the real one with 1990 sides.'; };
  setup();
  function f1(n) { return (+n).toFixed(1); }
  function ln(a, b, c, d, k, w, da) { return '<line x1="' + f1(a) + '" y1="' + f1(b) + '" x2="' + f1(c) + '" y2="' + f1(d) + '" stroke="' + k + '" stroke-width="' + (w || 2) + '"' + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linecap="round"/>'; }
  function ci(x, y, r, f, k, w, da) { return '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(r) + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + '/>'; }
  function pa(d, k, w, f, da) { return '<path d="' + d + '" fill="' + (f || 'none') + '"' + (k ? ' stroke="' + k + '" stroke-width="' + (w || 2) + '"' : '') + (da ? ' stroke-dasharray="' + da + '"' : '') + ' stroke-linejoin="round"/>'; }
  function re(x, y, w, h, f, k, r) { return '<rect x="' + f1(x) + '" y="' + f1(y) + '" width="' + f1(w) + '" height="' + f1(h) + '" rx="' + (r || 0) + '" fill="' + f + '"' + (k ? ' stroke="' + k + '" stroke-width="1.5"' : '') + '/>'; }
  function tx(x, y, s, k, sz, an, wt) { return '<text x="' + f1(x) + '" y="' + f1(y) + '" fill="' + k + '" font-size="' + (sz || 16) + '" text-anchor="' + (an || 'middle') + '"' + (wt ? ' font-weight="' + wt + '"' : '') + ' font-family="system-ui,sans-serif">' + s + '</text>'; }
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
  if (V.back) btn('Back', function () { stop(); V.back(); render(); });
  if (V.step) btn('Step', function () { stop(); V.step(); render(); });
  if (V.reset && V.advance) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
