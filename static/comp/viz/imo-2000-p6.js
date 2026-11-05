/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2000-p6. */
(window.CompViz = window.CompViz || {})['imo-2000-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 400, aria: '' };
  V.aria = 'An acute triangle with its incircle. The feet of the altitudes are joined in pairs, and each joining line is reflected in the line through two touch points of the incircle. The three reflected lines, drawn in red, form a small triangle whose corners sit on the incircle.';
  var u = 0.3, dir = 1, sc = 150;
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function add(a, b, t) { return [a[0] + t * b[0], a[1] + t * b[1]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function foot(P, A, B) { var d = sub(B, A); return add(A, d, dot(sub(P, A), d) / dot(d, d)); }
  function refl(P, A, B) { var F = foot(P, A, B); return [2 * F[0] - P[0], 2 * F[1] - P[1]]; }
  function meet(P, Q, R, S) { var d = sub(Q, P), e = sub(S, R), den = d[0] * e[1] - d[1] * e[0], t = ((R[0] - P[0]) * e[1] - (R[1] - P[1]) * e[0]) / den; return add(P, d, t); }
  function geo() {
    var A = [[-1.15, -0.75], [1.2, -0.75], [-0.55 + 1.2 * u, 1.05]];
    var a = [0, 1, 2].map(function (i) { return M.hypot(A[(i + 1) % 3][0] - A[(i + 2) % 3][0], A[(i + 1) % 3][1] - A[(i + 2) % 3][1]); });
    var p = a[0] + a[1] + a[2], I = [(a[0] * A[0][0] + a[1] * A[1][0] + a[2] * A[2][0]) / p, (a[0] * A[0][1] + a[1] * A[1][1] + a[2] * A[2][1]) / p];
    var K = [0, 1, 2].map(function (i) { return foot(A[i], A[(i + 1) % 3], A[(i + 2) % 3]); });
    var Lp = [0, 1, 2].map(function (i) { return foot(I, A[(i + 1) % 3], A[(i + 2) % 3]); });
    var r = M.hypot(Lp[0][0] - I[0], Lp[0][1] - I[1]);
    var N = [0, 1, 2].map(function (i) { var j = (i + 1) % 3; return [refl(K[i], Lp[i], Lp[j]), refl(K[j], Lp[i], Lp[j])]; });
    var Pt = [0, 1, 2].map(function (i) { var j = (i + 1) % 3; return meet(N[i][0], N[i][1], N[j][0], N[j][1]); });
    return { A: A, I: I, r: r, K: K, L: Lp, N: N, P: Pt };
  }
  function S(p) { return [320 + p[0] * sc, 205 - p[1] * sc]; }
  V.reset = function () { u = 0.3; dir = 1; };
  V.advance = function (dt) { u += dir * dt * 0.15; if (u > 0.85) { u = 0.85; dir = -1; } if (u < 0.15) { u = 0.15; dir = 1; } };
  V.step = function () { u += 0.12; if (u > 0.85) u = 0.15; };
  V.final = function () { u = 0.7; };
  V.draw = function (c, L) {
    var g = geo(), s = '', A = g.A.map(S), I = S(g.I), K = g.K.map(S), Lp = g.L.map(S), P = g.P.map(S);
    s += pa(poly(A, 1), c.axis, 2, c.greenSoft);
    s += ci(I[0], I[1], g.r * sc, 'none', c.green, 2.5);
    for (var i = 0; i < 3; i++) {
      var j = (i + 1) % 3;
      s += ln(K[i][0], K[i][1], K[j][0], K[j][1], c.blue, 1.5, '6 4');
      s += ln(Lp[i][0], Lp[i][1], Lp[j][0], Lp[j][1], c.orange, 1.2, '3 3');
      var Q = P[(i + 2) % 3], R = P[i], dx = R[0] - Q[0], dy = R[1] - Q[1];
      s += ln(Q[0] - 0.25 * dx, Q[1] - 0.25 * dy, R[0] + 0.25 * dx, R[1] + 0.25 * dy, c.red, 2.5);
    }
    for (i = 0; i < 3; i++) { s += ci(K[i][0], K[i][1], 3.5, c.blue) + ci(Lp[i][0], Lp[i][1], 3.5, c.orange) + ci(P[i][0], P[i][1], 5, c.red); L('A' + i, A[i][0] + (i === 2 ? 0 : (i ? 16 : -16)), A[i][1] + (i === 2 ? -14 : 10), 'A_' + (i + 1), c.ink); }
    s += ci(I[0], I[1], 3, c.green); L('I', I[0] + 10, I[1] + 10, 'I', c.green);
    var e = 0; g.P.forEach(function (q) { e = M.max(e, M.abs(M.hypot(q[0] - g.I[0], q[1] - g.I[1]) - g.r)); });
    L('f', 626, 385, '\\max\\,\\big|\\,|IX|-r\\,\\big| = ' + e.toFixed(6), c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'Blue dashed: lines joining feet of altitudes. Orange dotted: lines joining touch points. Red: the reflected lines. As the top corner moves, their three meeting points stay on the incircle (green).'; };
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
