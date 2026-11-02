/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2021-p3. */
(window.CompViz = window.CompViz || {})['imo-2021-p3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 470, aria: '' };
  V.aria = 'A triangle with a point D on the bisector from A, the points E and F, the two circumcircles and the circle of points P with PB/PC = DB/DC. The lines BC, EF and the line of the two centers meet at its center K.';
  var pre = [[0.513, 1.186, 0.274], [0.447, 0.983, 0.694], [0.607, 1.202, 0.549], [0.46, 1.193, 0.709]], pi = 1, gam = true;
  V.buttons = [['New triangle', function () { pi = (pi + 1) % pre.length; }], ['Circle Γ', function () { gam = !gam; }]];
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function add(a, b, t) { return [a[0] + t * b[0], a[1] + t * b[1]]; }
  function len(a) { return M.hypot(a[0], a[1]); }
  function unit(a) { var l = len(a); return [a[0] / l, a[1] / l]; }
  function angAt(p, q, r) { var u = sub(p, q), w = sub(r, q); return M.acos((u[0] * w[0] + u[1] * w[1]) / len(u) / len(w)); }
  function cc(a, b, c) {
    var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A2 = a[0] * a[0] + a[1] * a[1], B2 = b[0] * b[0] + b[1] * b[1], C2 = c[0] * c[0] + c[1] * c[1];
    var o = [(A2 * (b[1] - c[1]) + B2 * (c[1] - a[1]) + C2 * (a[1] - b[1])) / d, (A2 * (c[0] - b[0]) + B2 * (a[0] - c[0]) + C2 * (b[0] - a[0])) / d];
    return [o, len(sub(a, o))];
  }
  V.draw = function (c, L) {
    var p = pre[pi], A = [p[0], p[1]], B = [-1, 0], C = [1, 0], s = '';
    var bis = unit(add(unit(sub(B, A)), unit(sub(C, A)), 1)), Dp = add(A, bis, p[2]);
    var th = angAt(B, A, C) / 2, b1 = angAt(Dp, B, C), c1 = angAt(Dp, C, B), AD = len(sub(Dp, A));
    var E = add(A, unit(sub(C, A)), AD * M.sin(c1) / M.sin(th + c1)), F = add(A, unit(sub(B, A)), AD * M.sin(b1) / M.sin(th + b1));
    var u = unit(sub(C, A)), X = add(A, u, -A[0] / u[0]);
    var db = len(sub(Dp, B)), dc = len(sub(Dp, C)), K = [(dc * dc * B[0] - db * db * C[0]) / (dc * dc - db * db), 0];
    var w1 = cc(A, Dp, C), w2 = cc(E, X, Dp);
    var sc = 128, ox = 175, oy = 385;
    function q(P) { return [ox + sc * P[0], oy - sc * P[1]]; }
    function seg(P, Q, col, wd, da) { var a = q(P), b = q(Q); return ln(a[0], a[1], b[0], b[1], col, wd, da); }
    function circ(o, r, col, wd, da) { var z = q(o); return ci(z[0], z[1], r * sc, 'none', col, wd, da); }
    if (gam) s += circ(K, len(sub(K, Dp)), c.gold, 1.8, '5 4');
    s += circ(w1[0], w1[1], c.blue, 2) + circ(w2[0], w2[1], c.purple, 2);
    s += seg(A, B, c.ink, 2) + seg(A, C, c.ink, 2) + seg(B, K, c.ink, 2) + seg(X, A, c.muted, 1.5, '4 4');
    s += seg(A, Dp, c.muted, 1.5) + seg(Dp, E, c.muted, 1.5) + seg(Dp, F, c.muted, 1.5) + seg(Dp, B, c.muted, 1.2) + seg(Dp, C, c.muted, 1.2);
    s += seg(F, K, c.orange, 2.2) + seg(w1[0], K, c.green, 2.2) + seg(w2[0], w1[0], c.green, 2.2);
    var pts = { A: A, B: B, C: C, D: Dp, E: E, F: F, X: X, K: K }, off = { A: [-12, -12], B: [-14, 14], C: [6, 16], D: [-14, 8], E: [14, -6], F: [-14, -4], X: [-14, -6], K: [0, 18] };
    for (var nm in pts) { var z = q(pts[nm]); s += ci(z[0], z[1], nm === 'K' ? 5 : 4, nm === 'K' ? c.red : c.ink); L('p' + nm, z[0] + off[nm][0], z[1] + off[nm][1], nm, nm === 'K' ? c.red : c.ink); }
    var z1 = q(w1[0]), z2 = q(w2[0]); s += ci(z1[0], z1[1], 4, c.green) + ci(z2[0], z2[1], 4, c.green);
    L('o1', z1[0] + 14, z1[1] - 8, 'O_1', c.green); L('o2', z2[0] + 14, z2[1] - 8, 'O_2', c.green);
    L('f', 14, 24, '\\dfrac{KB}{KC}=\\dfrac{DB^2}{DC^2}', c.red, 'l');
    return s;
  };
  V.cap = function () { return 'Blue: the circle through A, D, C. Purple: the circle through E, X, D. Gold (dashed): the points P with PB/PC = DB/DC, centered at K. Line EF (orange) and the line of centers (green) both reach K on line BC.'; };
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
