/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2008-a2. */
(window.CompViz = window.CompViz || {})['putnam-2008-a2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 320; var n = 6, B, seq, done;
  V.aria = 'A 6 by 6 board whose columns are paired. Each round the first player writes a number in an empty cell and the second player copies it into the partner cell in the same row. At the end, columns 1 and 2 are equal, so the determinant is zero.';
  function rnd(k) { return M.floor(M.random() * k); }
  V.reset = function () { B = []; for (var i = 0; i < n; i++) { B.push([]); for (var j = 0; j < n; j++) B[i].push(null); } seq = 0; done = 0; };
  V.step = function () {
    var e = []; for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) if (!B[i][j]) e.push([i, j]);
    if (!e.length) return; var c = e[rnd(e.length)], t = rnd(19) - 9, pj = c[1] % 2 ? c[1] - 1 : c[1] + 1;
    seq++; B[c[0]][c[1]] = { v: t, w: 'A', s: seq }; B[c[0]][pj] = { v: t, w: 'B', s: seq };
  };
  var acc = 0;
  V.advance = function (dt) { acc += dt; if (acc > 0.45) { acc = 0; V.step(); } if (V.done()) return false; };
  V.done = function () { return seq >= n * n / 2; };
  V.final = function () { while (!V.done()) V.step(); };
  V.draw = function (c, L) {
    var s = '', x0 = 24, y0 = 34, cs = 40, i, j;
    for (j = 0; j < n; j += 2) s += '<rect x="' + (x0 + j * cs) + '" y="' + (y0 - 4) + '" width="' + (2 * cs) + '" height="' + (n * cs + 8) + '" rx="6" fill="' + (j % 4 ? c.blueSoft : c.goldSoft) + '"/>';
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var o = B[i][j], x = x0 + j * cs, y = y0 + i * cs;
      s += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (cs - 4) + '" height="' + (cs - 4) + '" rx="4" fill="' + c.panel + '" stroke="' + (o && o.s === seq ? c.red : c.grid) + '" stroke-width="' + (o && o.s === seq ? 2.5 : 1) + '"/>';
      if (o) s += tx(x + cs / 2, y + cs / 2 + 6, o.v < 0 ? '−' + (-o.v) : '' + o.v, o.w === 'A' ? c.blue : c.orange, 17);
    }
    for (j = 0; j < n; j++) s += tx(x0 + j * cs + cs / 2, y0 + n * cs + 26, 'C' + (j + 1), c.muted, 13);
    L('a', 300, 50, '\\text{Alan writes } t', c.blue, 'l');
    L('b', 300, 84, '\\text{Barbara copies } t \\text{ next door}', c.orange, 'l');
    L('c', 300, 140, '\\text{columns paired: }(C_1,C_2),\\ (C_3,C_4),\\dots', c.ink, 'l');
    L('d', 300, 190, '\\text{after each round: every pair is}', c.muted, 'l');
    L('e', 300, 216, '\\text{fully empty or fully filled}', c.muted, 'l');
    L('f', 300, 272, V.done() ? 'C_1=C_2\\ \\Rightarrow\\ \\det=0' : '\\text{round } ' + seq + ' \\text{ of } 18', V.done() ? c.green : c.ink, 'l');
    return s;
  };
  V.cap = function () { return V.done() ? 'Board full. Every pair of partner columns is identical, so the determinant is 0 whatever Alan chose.' : 'Blue numbers are Alan’s moves; orange numbers are Barbara’s copies in the partner column. (A 6 by 6 board stands in for 2008 by 2008.)'; };
  V.buttons = [['New game', function () { V.reset(); }]];
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
