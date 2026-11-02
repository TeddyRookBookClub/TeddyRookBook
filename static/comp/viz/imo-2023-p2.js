/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2023-p2. */
(window.CompViz = window.CompViz || {})['imo-2023-p2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 470, aria: '' };
  V.aria = 'The circumcircle with the arc midpoints S and T, the altitude through A, the circle through B, D and L, and the tangent at P passing through the point X where BS meets the bisector AT.';
  var tris = [[58, 72, 50], [50, 76, 54], [68, 66, 46], [46, 80, 54]], ti = 0, st = 0, NST = 3;
  V.step = function () { st = M.min(NST, st + 1); }; V.back = function () { st = M.max(0, st - 1); };
  V.buttons = [['New triangle', function () { ti = (ti + 1) % tris.length; }]];
  V.reset = function () { st = 0; };
  function I(p, d, q, e) { var den = d[0] * e[1] - d[1] * e[0], t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den; return [p[0] + t * d[0], p[1] + t * d[1]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function cc(a, b, c) {
    var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A2 = a[0] * a[0] + a[1] * a[1], B2 = b[0] * b[0] + b[1] * b[1], C2 = c[0] * c[0] + c[1] * c[1];
    var o = [(A2 * (b[1] - c[1]) + B2 * (c[1] - a[1]) + C2 * (a[1] - b[1])) / d, (A2 * (c[0] - b[0]) + B2 * (a[0] - c[0]) + C2 * (b[0] - a[0])) / d];
    return [o, M.hypot(a[0] - o[0], a[1] - o[1])];
  }
  V.draw = function (c, L) {
    var t = tris[ti], r = M.PI / 180, A0 = t[0] * r, B0 = t[1] * r, C0 = t[2] * r, s = '';
    var A = [-M.sin(B0 - C0), M.cos(B0 - C0)], B = [-M.sin(A0), -M.cos(A0)], C = [M.sin(A0), -M.cos(A0)], S = [0, 1], T = [0, -1];
    var E = [A[0], -A[1]], Dp = I(A, [0, 1], B, sub(S, B)), Lp = I(Dp, [1, 0], B, sub(E, B));
    var w = cc(B, Dp, Lp), u = sub(Lp, S), k = -2 * (S[0] * u[0] + S[1] * u[1]) / (u[0] * u[0] + u[1] * u[1]), P = [S[0] + k * u[0], S[1] + k * u[1]];
    var X = I(A, sub(T, A), B, sub(S, B)), ab = cc(A, B, Dp);
    var Rp = 188, ox = 402, oy = 222;
    function q(p) { return [ox + Rp * p[0], oy - Rp * p[1]]; }
    function seg(p1, p2, col, wd, da, ext) { ext = ext || 0; var d = sub(p2, p1), a = [p1[0] - ext * d[0], p1[1] - ext * d[1]], b = [p2[0] + ext * d[0], p2[1] + ext * d[1]], qa = q(a), qb = q(b); return ln(qa[0], qa[1], qb[0], qb[1], col, wd, da); }
    function circ(o, rr, col, wd, da) { var z = q(o); return ci(z[0], z[1], rr * Rp, 'none', col, wd, da); }
    s += circ([0, 0], 1, c.axis, 1.5);
    s += seg(A, B, c.ink, 2) + seg(B, C, c.ink, 2) + seg(C, A, c.ink, 2);
    s += seg(A, E, c.muted, 1.5, '5 4') + seg(B, S, c.blue, 2) + seg(Lp, E, c.muted, 1.5) + seg(Dp, Lp, c.muted, 1.5);
    s += seg(A, T, c.green, 2.5);
    s += circ(w[0], w[1], c.teal, 2);
    if (st >= 1) s += seg(S, P, c.purple, 2, '6 4');
    if (st >= 2) s += circ(ab[0], ab[1], c.gold, 1.8, '4 4');
    if (st >= 3) {
      var rad = sub(P, w[0]), tg = [-rad[1], rad[0]], nn = M.hypot(tg[0], tg[1]); tg = [tg[0] / nn, tg[1] / nn];
      var far = M.hypot(X[0] - P[0], X[1] - P[1]) * 1.4 + .2;
      s += seg([P[0] - tg[0] * far, P[1] - tg[1] * far], [P[0] + tg[0] * far, P[1] + tg[1] * far], c.orange, 2.5);
      s += circ(X, M.hypot(X[0] - A[0], X[1] - A[1]), c.red, 1.5, '3 4');
    }
    var pts = { A: A, B: B, C: C, S: S, T: T, E: E, D: Dp, L: Lp, P: P }, off = { A: [-14, -12], B: [-16, 12], C: [14, 12], S: [0, -16], T: [0, 18], E: [12, 16], D: [-14, -4], L: [14, -8], P: [14, -12] };
    for (var nm in pts) { var z = q(pts[nm]); s += ci(z[0], z[1], 4, c.ink); L('p' + nm, z[0] + off[nm][0], z[1] + off[nm][1], nm, c.ink); }
    var zx = q(X); s += ci(zx[0], zx[1], st >= 2 ? 5 : 0, c.red); L('pX', zx[0] - 16, zx[1] + 4, st >= 2 ? 'X' : '', c.red);
    L('w', q(w[0])[0] + w[1] * Rp * .72, q(w[0])[1] + w[1] * Rp * .72, '\\omega', c.teal);
    var msg = ['\\text{bisector }AT\\ (\\text{green}),\\ \\omega\\ (\\text{teal})', '\\text{Step 1: }S,\\ L,\\ P\\ \\text{collinear}', '\\text{Step 2: }XA^2=XB\\cdot XD', '\\text{tangent at }P\\text{ passes through }X,\\ XP=XA'];
    L('m', 12, 452, msg[st], c.ink, 'l');
    return s;
  };
  V.cap = function () { return ['Setup. Press Step to follow the solution.', 'Step 1: the line from S through L meets the circumcircle again at P.', 'Step 2: the bisector AT touches the circle through A, B and D (gold), so X has the same power with respect to that circle and to ω.', 'Steps 3 and 4: the tangent at P (orange) passes through X. The red circle about X goes through A and P.'][st]; };
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
