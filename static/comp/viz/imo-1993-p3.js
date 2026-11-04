/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1993-p3. */
(window.CompViz = window.CompViz || {})['imo-1993-p3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'Peg solitaire on a square block of pieces. A three-jump gadget clears a line of three pieces using a helper piece that ends where it started; strips of width three are peeled off until one piece is left.';
  var n = 5, moves = [], k = 0, P0 = null, cur = null, X0 = 0, Y0 = 0, X1 = 0, Y1 = 0;
  function key(x, y) { return x + ',' + y; }
  function plan() {
    var Pc = {}, mv = [], x0 = 0, y0 = 0, N = n, x, y, r;
    for (x = 1; x <= n; x++) for (y = 1; y <= n; y++) Pc[key(x, y)] = 1;
    function j(h, a, e) { mv.push([h, a, e]); }
    function g(a, b, cc, h, e) { j(h, a, e); j(cc, b, a); j(e, a, h); }
    while (N >= 4) {
      var X = function (i) { return x0 + i; }, Y = function (i) { return y0 + i; };
      for (r = N; r >= 4; r--) g([X(N - 2), Y(r)], [X(N - 1), Y(r)], [X(N), Y(r)], [X(N - 2), Y(r - 1)], [X(N - 2), Y(r + 1)]);
      for (x = N; x >= 4; x--) g([X(x), Y(3)], [X(x), Y(2)], [X(x), Y(1)], [X(x - 1), Y(3)], [X(x + 1), Y(3)]);
      for (r = 1; r <= 3; r++) g([X(1), Y(r)], [X(2), Y(r)], [X(3), Y(r)], [X(1), Y(r + 1)], [X(1), Y(r - 1)]);
      y0 += 3; N -= 3;
    }
    if (N === 2) { j([x0 + 1, y0 + 1], [x0 + 2, y0 + 1], [x0 + 3, y0 + 1]); j([x0 + 1, y0 + 2], [x0 + 2, y0 + 2], [x0 + 3, y0 + 2]); j([x0 + 3, y0 + 1], [x0 + 3, y0 + 2], [x0 + 3, y0 + 3]); }
    moves = mv; P0 = Pc; X0 = 0; Y0 = 0; X1 = n + 1; Y1 = n + 1;
    mv.forEach(function (m) { m.forEach(function (p) { X0 = M.min(X0, p[0]); Y0 = M.min(Y0, p[1]); X1 = M.max(X1, p[0]); Y1 = M.max(Y1, p[1]); }); });
  }
  function apply(upto) { cur = {}; for (var q in P0) cur[q] = 1; for (var i = 0; i < upto; i++) { var m = moves[i]; delete cur[key(m[0][0], m[0][1])]; delete cur[key(m[1][0], m[1][1])]; cur[key(m[2][0], m[2][1])] = 1; } }
  var acc = 0;
  V.reset = function () { k = 0; acc = 0; apply(0); };
  V.step = function () { if (k < moves.length) { k++; apply(k); } };
  V.back = function () { if (k > 0) { k--; apply(k); } };
  V.advance = function (dt) { acc += dt; if (acc > 0.32) { acc = 0; V.step(); if (k >= moves.length) return false; } };
  V.done = function () { return k >= moves.length; };
  V.final = function () { k = moves.length; apply(k); };
  V.buttons = [['n = 4', function () { n = 4; plan(); V.reset(); }], ['n = 5', function () { n = 5; plan(); V.reset(); }], ['n = 7', function () { n = 7; plan(); V.reset(); }], ['n = 8', function () { n = 8; plan(); V.reset(); }]];
  V.draw = function (c, L) {
    var s = '', cols = X1 - X0 + 1, rows = Y1 - Y0 + 1, sz = M.min(560 / cols, 340 / rows), ox = 320 - cols * sz / 2, oy = 20;
    function px(x) { return ox + (x - X0 + 0.5) * sz; } function py(y) { return oy + (Y1 - y + 0.5) * sz; }
    var colr = [c.blueSoft, c.goldSoft, c.greenSoft];
    for (var x = X0; x <= X1; x++) for (var y = Y0; y <= Y1; y++) {
      var inB = x >= 1 && x <= n && y >= 1 && y <= n;
      s += re(px(x) - sz / 2 + 1, py(y) - sz / 2 + 1, sz - 2, sz - 2, inB ? colr[((x + y) % 3 + 3) % 3] : 'none', c.grid, 3);
    }
    var last = k > 0 ? moves[k - 1] : null;
    if (last) s += ln(px(last[0][0]), py(last[0][1]), px(last[2][0]), py(last[2][1]), c.red, 2, '5 4');
    var cnt = [0, 0, 0], tot = 0;
    for (var q in cur) { var p = q.split(',').map(Number), hot = last && p[0] === last[2][0] && p[1] === last[2][1]; s += ci(px(p[0]), py(p[1]), sz * 0.32, hot ? c.red : c.ink); cnt[((p[0] + p[1]) % 3 + 3) % 3]++; tot++; }
    L('c', 16, 400, '\\text{pieces } ' + tot + '\\quad\\text{color counts mod 2: }(' + cnt.map(function (v) { return v % 2; }).join(',') + ')', c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'n = ' + n + ', jump ' + k + ' of ' + moves.length + '. Tinted squares are the starting block, shaded by x + y mod 3; the red piece just jumped. Every jump flips all three color parities together.'; };
  plan(); apply(0);
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
