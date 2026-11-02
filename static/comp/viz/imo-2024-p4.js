/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2024-p4. */
(window.CompViz = window.CompViz || {})['imo-2024-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 460;
  V.aria = 'Construction for the incircle problem: triangle ABC with its incircle, the reflection A* of A in the incenter, the points X and Y on BC, the arc midpoint P, and two circles through P and A*. The angle YPX and the angle KIL add up to 180 degrees.';
  var st = 0, N = 5, acc = 0, ph = 0;
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1]]; } function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; } function mul(p, k) { return [p[0] * k, p[1] * k]; }
  function len(p) { return M.hypot(p[0], p[1]); } function cr(a, b) { return a[0] * b[1] - a[1] * b[0]; }
  function inter(p, r, q, s) { var t = cr(sub(q, p), s) / cr(r, s); return add(p, mul(r, t)); }
  function circ(a, b, c) { var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A2 = a[0] * a[0] + a[1] * a[1], B2 = b[0] * b[0] + b[1] * b[1], C2 = c[0] * c[0] + c[1] * c[1];
    var o = [(A2 * (b[1] - c[1]) + B2 * (c[1] - a[1]) + C2 * (a[1] - b[1])) / d, (A2 * (c[0] - b[0]) + B2 * (a[0] - c[0]) + C2 * (b[0] - a[0])) / d]; return [o, len(sub(a, o))]; }
  function geo() {
    var A = [1.55 + 0.25 * M.sin(ph), 3.5 + 0.2 * M.cos(ph * 0.7)], B = [0, 0], Cc = [6, 0];
    var a = len(sub(B, Cc)), b = len(sub(A, Cc)), c = len(sub(A, B)), I = mul(add(add(mul(A, a), mul(B, b)), mul(Cc, c)), 1 / (a + b + c)), r = I[1];
    var As = sub(mul(I, 2), A), X = inter(As, sub(Cc, A), B, [1, 0]), Y = inter(As, sub(B, A), B, [1, 0]);
    var O = circ(A, B, Cc), d = sub(I, A), u = mul(d, 1 / len(d)), t = -2 * (u[0] * (A[0] - O[0][0]) + u[1] * (A[1] - O[0][1])), P = add(A, mul(u, t));
    return { A: A, B: B, C: Cc, I: I, r: r, As: As, X: X, Y: Y, P: P, O: O, K: mul(add(A, Cc), 0.5), L: mul(add(A, B), 0.5), c1: circ(B, As, P), c2: circ(Cc, As, P) };
  }
  var sc = 50, ox = 100, oy = 220;
  function fit() { var g = geo(), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    [[g.O[0], g.O[1]], [g.c1[0], g.c1[1]], [g.c2[0], g.c2[1]]].forEach(function (q) { x0 = M.min(x0, q[0][0] - q[1]); x1 = M.max(x1, q[0][0] + q[1]); y0 = M.min(y0, q[0][1] - q[1]); y1 = M.max(y1, q[0][1] + q[1]); });
    sc = M.min(600 / (x1 - x0), (V.H - 60) / (y1 - y0)) * 0.93; ox = 320 - sc * (x0 + x1) / 2; oy = 44 + (V.H - 50) / 2 + sc * (y0 + y1) / 2; }
  function Z(p) { return [ox + p[0] * sc, oy - p[1] * sc]; }
  function angDeg(p, v, q) { var a = sub(p, v), b = sub(q, v); return M.acos((a[0] * b[0] + a[1] * b[1]) / len(a) / len(b)) * 180 / M.PI; }
  function arc(v, p, q, rad, k) { var a1 = M.atan2(-(p[1] - v[1]), p[0] - v[0]), a2 = M.atan2(-(q[1] - v[1]), q[0] - v[0]), Vv = Z(v); var d = a2 - a1; while (d > M.PI) d -= 2 * M.PI; while (d < -M.PI) d += 2 * M.PI;
    var e = a1 + d, s = [Vv[0] + rad * M.cos(a1), Vv[1] + rad * M.sin(a1)], f = [Vv[0] + rad * M.cos(e), Vv[1] + rad * M.sin(e)];
    return pa('M' + f1(s[0]) + ' ' + f1(s[1]) + 'A' + rad + ' ' + rad + ' 0 0 ' + (d > 0 ? 1 : 0) + ' ' + f1(f[0]) + ' ' + f1(f[1]), k, 3); }
  V.reset = function () { st = 0; acc = 0; ph = 0; fit(); };
  V.step = function () { st = (st + 1) % N; };
  V.back = function () { st = (st + N - 1) % N; };
  V.advance = function (dt) { acc += dt; ph += dt * 0.5; if (acc > 3) { acc = 0; st = (st + 1) % N; } };
  V.final = function () { st = N - 1; };
  V.draw = function (c, L) {
    var g = geo(), s = '', A = Z(g.A), B = Z(g.B), C = Z(g.C), I = Z(g.I), As = Z(g.As), X = Z(g.X), Y = Z(g.Y), P = Z(g.P), K = Z(g.K), Lm = Z(g.L), O = Z(g.O[0]);
    s += ci(O[0], O[1], g.O[1] * sc, null, c.grid, 1.5);
    s += pa(poly([A, B, C], 1), c.ink, 2);
    s += ci(I[0], I[1], g.r * sc, c.greenSoft, c.green, 2);
    if (st >= 1) { s += ln(A[0], A[1], As[0], As[1], c.muted, 1.5, '5 4') + ln(K[0], K[1], I[0], I[1], c.blue, 2.5) + ln(Lm[0], Lm[1], I[0], I[1], c.blue, 2.5) + ln(B[0], B[1], As[0], As[1], c.blue, 1.5, '6 4') + ln(C[0], C[1], As[0], As[1], c.blue, 1.5, '6 4') + arc(g.I, g.K, g.L, 16, c.blue); }
    if (st >= 2) { var e1 = sub(g.C, g.A), e2 = sub(g.B, g.A); s += ln.apply(null, Z(add(g.As, mul(e1, -0.35))).concat(Z(add(g.As, mul(e1, 0.5))), [c.orange, 2])) + ln.apply(null, Z(add(g.As, mul(e2, -0.55))).concat(Z(add(g.As, mul(e2, 0.45))), [c.orange, 2])); }
    if (st >= 3) { s += ln(A[0], A[1], P[0], P[1], c.muted, 1.5, '2 4') + ci(Z(g.c1[0])[0], Z(g.c1[0])[1], g.c1[1] * sc, null, c.purple, 2, '7 5') + ci(Z(g.c2[0])[0], Z(g.c2[0])[1], g.c2[1] * sc, null, c.teal, 2, '7 5'); }
    if (st >= 4) { s += ln(P[0], P[1], X[0], X[1], c.red, 2.5) + ln(P[0], P[1], Y[0], Y[1], c.red, 2.5) + arc(g.P, g.Y, g.X, 22, c.red); }
    var pts = [['A', A, 0, -14], ['B', B, -12, 6], ['C', C, 12, 6], ['I', I, -14, -8]];
    if (st >= 1) pts.push(['K', K, 13, -6], ['L', Lm, -13, -6], ['A^*', As, -18, 10]);
    if (st >= 2) pts.push(['X', X, -6, -14], ['Y', Y, 6, -14]);
    if (st >= 3 || st === 0) pts.push(['P', P, 12, 10]);
    pts.forEach(function (q) { s += ci(q[1][0], q[1][1], 3.5, c.ink); L('p' + q[0], q[1][0] + q[2], q[1][1] + q[3], q[0], c.ink); });
    for (var k = 0; k < 7; k++) if (!pts.some(function (q) { return q[0] === ['A', 'B', 'C', 'I', 'K', 'L', 'A^*'][k]; })) { }
    var kil = angDeg(g.K, g.I, g.L), ypx = angDeg(g.Y, g.P, g.X), msg = [
      ['\\text{incircle }\\omega,\\ \\text{incenter } I', c.green],
      ['\\angle KIL=\\angle BA^*C\\ (\\text{doubling from }A)', c.blue],
      ['A^*X\\parallel AC,\\quad A^*Y\\parallel AB', c.orange],
      ['B,A^*,X,P\\ \\text{and}\\ C,A^*,Y,P\\ \\text{concyclic}', c.purple],
      ['\\angle KIL+\\angle YPX=' + kil.toFixed(1) + '^\\circ+' + ypx.toFixed(1) + '^\\circ=180^\\circ', c.red]][st];
    L('m', 20, 22, msg[0], msg[1], 'l');
    return s;
  };
  V.cap = function () { return 'Step ' + (st + 1) + ' of ' + N + '. ' + ['Start: triangle ABC (AB < AC < BC) with its incircle.', 'A* is the reflection of A in I. Doubling from A sends L, K, I to B, C, A*.', 'The second tangents parallel to AC and AB pass through A* and meet BC at X and Y.', 'P is the arc midpoint on line AI. Both dashed circles pass through P and A*.', 'The red angle at P and the blue angle at I add up to 180 degrees.'][st]; };
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
