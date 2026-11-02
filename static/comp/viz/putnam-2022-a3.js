/* Our own visualization for the Teddy Rook Book Putnam solutions guide: putnam-2022-a3. */
(window.CompViz = window.CompViz || {})['putnam-2022-a3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 300, aria: '' };
  V.H = 300; var p = 11, pairs = [], idx = 0, acc = 0;
  V.aria = 'Five terms of the recurrence modulo 11 placed around a pentagon. The pattern repeats every five steps. Starting pairs fall into groups of five, except the two constant sequences.';
  function inv(a) { for (var b = 1; b < p; b++) if (a * b % p === 1) return b; return 0; }
  function seq(x, y) { var a = [x, y]; for (var i = 0; i < 3; i++) { var u = a[a.length - 2], v = a[a.length - 1]; a.push((1 + v) * inv(u) % p); } return a; }
  (function () { for (var x = 1; x < p; x++) for (var y = 1; y < p; y++) { var q = seq(x, y); if (q.every(function (t) { return t > 0; })) pairs.push(q); } })();
  V.reset = function () { idx = 0; acc = 0; };
  V.advance = function (dt) { acc += dt; if (acc > 1.4) { acc = 0; idx = (idx + 1) % pairs.length; } };
  V.step = function () { idx = (idx + 1) % pairs.length; };
  var cst = [], ck = -1; pairs.forEach(function (q, i) { if (q[0] === q[1] && q[1] === q[2]) cst.push(i); });
  V.buttons = [['Constant one', function () { ck = (ck + 1) % cst.length; idx = cst[ck]; }]];
  V.final = function () { idx = 0; };
  V.draw = function (c, L) {
    var q = pairs[idx], cx = 170, cy = 155, R = 105, s = '', i, P = [];
    for (i = 0; i < 5; i++) { var an = -M.PI / 2 + i * 2 * M.PI / 5; P.push([cx + R * M.cos(an), cy + R * M.sin(an)]); }
    s += pa(poly(P, 1), c.grid, 1.5);
    for (i = 0; i < 5; i++) {
      var A = P[i], B = P[(i + 1) % 5], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
      s += ln(A[0] + (B[0] - A[0]) * .2, A[1] + (B[1] - A[1]) * .2, A[0] + (B[0] - A[0]) * .8, A[1] + (B[1] - A[1]) * .8, c.green, 2.5);
      s += ci(A[0] + (B[0] - A[0]) * .8, A[1] + (B[1] - A[1]) * .8, 4, c.green);
    }
    var fixed = q[0] === q[1] && q[1] === q[2];
    for (i = 0; i < 5; i++) { s += ci(P[i][0], P[i][1], 24, c.bg, fixed ? c.gold : c.blue, 3) + tx(P[i][0], P[i][1] + 7, q[i], c.ink, 21); L('n' + i, P[i][0] + (P[i][0] - cx) * .42, P[i][1] + (P[i][1] - cy) * .36, 'a_{' + (i + 1) + '}', c.muted); }
    L('r', 330, 50, 'a_{n+2}\\equiv\\dfrac{1+a_{n+1}}{a_n}\\pmod{11}', c.ink, 'l');
    L('x', 330, 100, 'a_3=\\tfrac{1+y}{x},\\ a_4=\\tfrac{1+x+y}{xy}', c.ink, 'l');
    L('s', 330, 140, 'a_5=\\tfrac{1+x}{y},\\ a_6=x,\\ a_7=y', c.green, 'l');
    L('f', 330, 205, 'f(11)=' + pairs.length + '=2+5\\cdot' + (pairs.length - 2) / 5, c.ink, 'l');
    L('c', 330, 250, 'x^2\\equiv x+1:\\ x\\equiv4,\\,8', c.gold, 'l');
    return s;
  };
  V.cap = function () { var q = pairs[idx]; return 'Start (x, y) = (' + q[0] + ', ' + q[1] + '). Following the arrows, the sixth term is x again. Shifting the start moves around the same pentagon, so starting pairs come in groups of 5, except the constant sequences (gold).'; };
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
