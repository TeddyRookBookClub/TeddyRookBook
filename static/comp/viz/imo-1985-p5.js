/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1985-p5. */
(window.CompViz = window.CompViz || {})['imo-1985-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'Triangle ABC with a circle through A and C, centered at O, cutting AB at K and BC at N. The circles ABC and BKN meet again at M. Step by step: the three radical axes AC, KN and BM meet at P, the points M, N, C, P lie on a circle, and finally OM is perpendicular to BM.';
  var st = 0, sh = 0.4, N_ST = 5;
  var A = [360, 370], B = [400, 40], C = [600, 370];
  function cc(a, b, c2) { var ax = a[0], ay = a[1], bx = b[0], by = b[1], qx = c2[0], qy = c2[1], d = 2 * (ax * (by - qy) + bx * (qy - ay) + qx * (ay - by));
    var ux = ((ax * ax + ay * ay) * (by - qy) + (bx * bx + by * by) * (qy - ay) + (qx * qx + qy * qy) * (ay - by)) / d, uy = ((ax * ax + ay * ay) * (qx - bx) + (bx * bx + by * by) * (ax - qx) + (qx * qx + qy * qy) * (bx - ax)) / d; return [ux, uy]; }
  function dd(p, q) { return M.hypot(p[0] - q[0], p[1] - q[1]); }
  function sec(P0, Q, O, r) { var dx = Q[0] - P0[0], dy = Q[1] - P0[1], t = -2 * ((P0[0] - O[0]) * dx + (P0[1] - O[1]) * dy) / (dx * dx + dy * dy); return [P0[0] + t * dx, P0[1] + t * dy]; }
  function X(p, q, r, s) { var d1x = q[0] - p[0], d1y = q[1] - p[1], d2x = s[0] - r[0], d2y = s[1] - r[1], den = d1x * d2y - d1y * d2x, k = ((r[0] - p[0]) * d2y - (r[1] - p[1]) * d2x) / den; return [p[0] + k * d1x, p[1] + k * d1y]; }
  function geo() {
    var K0 = [A[0] + sh * (B[0] - A[0]), A[1] + sh * (B[1] - A[1])], O = cc(A, C, K0), r = dd(O, A);
    var K = sec(A, B, O, r), Nn = sec(C, B, O, r), G = cc(A, B, C), g = cc(B, K, Nn);
    var dx = g[0] - G[0], dy = g[1] - G[1], t = ((B[0] - G[0]) * dx + (B[1] - G[1]) * dy) / (dx * dx + dy * dy), F = [G[0] + t * dx, G[1] + t * dy], Mp = [2 * F[0] - B[0], 2 * F[1] - B[1]];
    var P = X(A, C, K, Nn);
    return { O: O, r: r, K: K, N: Nn, G: G, g: g, M: Mp, P: P, h: cc(Mp, Nn, C) };
  }
  V.reset = function () { st = 0; };
  V.step = function () { st = M.min(N_ST - 1, st + 1); };
  V.back = function () { st = M.max(0, st - 1); };
  V.final = function () { st = N_ST - 1; };
  V.draw = function (c, L) {
    var g = geo(), s = '';
    function full(p, q, k, w, da) { var dx = q[0] - p[0], dy = q[1] - p[1], d = M.hypot(dx, dy); return ln(p[0] - dx / d * 900, p[1] - dy / d * 900, q[0] + dx / d * 900, q[1] + dy / d * 900, k, w, da); }
    s += ci(g.O[0], g.O[1], g.r, 'none', c.green, 2);
    if (st >= 1) s += ci(g.G[0], g.G[1], dd(g.G, A), 'none', c.axis, 1.5) + ci(g.g[0], g.g[1], dd(g.g, B), 'none', c.blue, 2);
    if (st >= 2) s += full(A, C, c.purple, 1.5, '6 4') + full(g.K, g.N, c.purple, 1.5, '6 4') + full(B, g.M, c.purple, 1.5, '6 4');
    if (st >= 3) s += ci(g.h[0], g.h[1], dd(g.h, g.M), 'none', c.orange, 2, '3 3');
    s += pa(poly([A, B, C], 1), c.ink, 2);
    if (st >= 4) { s += ln(g.O[0], g.O[1], g.M[0], g.M[1], c.red, 3); var u = [(B[0] - g.M[0]) / dd(B, g.M), (B[1] - g.M[1]) / dd(B, g.M)], v = [(g.O[0] - g.M[0]) / dd(g.O, g.M), (g.O[1] - g.M[1]) / dd(g.O, g.M)], q = 13;
      s += pa('M' + f1(g.M[0] + u[0] * q) + ' ' + f1(g.M[1] + u[1] * q) + 'L' + f1(g.M[0] + (u[0] + v[0]) * q) + ' ' + f1(g.M[1] + (u[1] + v[1]) * q) + 'L' + f1(g.M[0] + v[0] * q) + ' ' + f1(g.M[1] + v[1] * q), c.red, 2); }
    var pts = [['A', A, c.ink, [-14, 8]], ['B', B, c.ink, [0, -15]], ['C', C, c.ink, [14, 8]], ['K', g.K, c.green, [-14, -4]], ['N', g.N, c.green, [14, -4]], ['O', g.O, c.green, [0, 16]]];
    if (st >= 1) pts.push(['M', g.M, c.red, [14, 12]]);
    if (st >= 2) pts.push(['P', g.P, c.purple, [0, 16]]);
    pts.forEach(function (p) { if (p[1][0] > -50 && p[1][0] < 690 && p[1][1] > -50 && p[1][1] < 470) { s += ci(p[1][0], p[1][1], 4.5, p[2]); L(p[0], p[1][0] + p[3][0], p[1][1] + p[3][1], p[0], p[2]); } else L(p[0], 0, 0, '', p[2]); });
    var f = ['', '\\text{circles }(ABC),\\ (BKN)\\text{ meet at }M', 'AC,\\ KN,\\ BM\\text{ meet at }P', 'M,N,C,P\\text{ concyclic}', 'OP^2-PM^2=OB^2-BM^2\\Rightarrow OM\\perp BM'][st];
    L('f', 14, 404, f, c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Step ' + (st + 1) + ' of ' + N_ST + '. ' + ['The green circle has center O and passes through A, K, N, C.', 'Grey: circle ABC. Blue: circle BKN. They meet again at M.', 'The three dashed lines are the radical axes of the three circles, so they pass through one point P.', 'Angle chasing puts M, N, C, P on the orange circle; B has the same power with respect to it as to the green circle.', 'Comparing the powers of B and P gives the right angle at M.'][st]; };
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
