/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1972-p2. */
(window.CompViz = window.CompViz || {})['imo-1972-p2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 400, aria: '' };
  V.aria = 'A quadrilateral inscribed in a circle, cut into n smaller quadrilaterals that each have a circumscribed circle. For four pieces the cuts meet at one inner point like a pinwheel; for more pieces there is a parallel cut, an isosceles trapezoid cut into strips, and a triangle cut into three kites around its incenter.';
  var n = 4, circ = false, R = M.PI / 180, sc = 165;
  var Q = [200, 262, 5, 140].map(function (t) { return [M.cos(t * R), M.sin(t * R)]; });
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function cr(a, b) { return a[0] * b[1] - a[1] * b[0]; }
  function dt(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function nr(a) { var l = M.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; }
  function rot(v, d) { var c = M.cos(d * R), s = M.sin(d * R); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; }
  function ang(P, O, Z) { var u = nr(sub(P, O)), v = nr(sub(Z, O)); return M.acos(M.max(-1, M.min(1, dt(u, v)))) / R; }
  function meet(P, d, A, e) { return [P[0] + d[0] * cr(sub(A, P), e) / cr(d, e), P[1] + d[1] * cr(sub(A, P), e) / cr(d, e)]; }
  function lerp(a, b, s) { return [a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])]; }
  function lab(f) { for (var h = 0; h < 4; h++) { var T = Q.slice(h).concat(Q.slice(0, h)); if (f(T)) return T; } return Q; }
  function pin() {
    var T = lab(function (T) { return ang(T[2], T[3], T[0]) <= 90; }), A = T[0], B = T[1], C = T[2];
    var u = nr(sub(C, B)), d = rot(u, ang(A, B, T[3])); if (cr(u, d) * cr(u, sub(A, B)) < 0) d = rot(u, -ang(A, B, T[3]));
    var P = meet(B, d, A, sub(C, A)), g = 0, f = 0, i;
    for (i = 0; i < 4; i++) { f = M.max(f, ang(P, T[i], T[(i + 1) % 4])); g = M.max(g, ang(P, T[i], T[(i + 3) % 4])); }
    var x = (g + 180 - f) / 2, X = [];
    for (i = 0; i < 4; i++) { var e = nr(sub(T[(i + 1) % 4], T[i])), w = rot([-e[0], -e[1]], -x); if (cr(e, w) < 0) w = rot([-e[0], -e[1]], x); X.push(meet(P, w, T[i], e)); }
    var pc = []; for (i = 0; i < 4; i++) pc.push([P, X[(i + 3) % 4], T[i], X[i]]);
    return pc;
  }
  function big() {
    var T = null, bd = -1; [Q, Q.slice().reverse()].forEach(function (Z) { for (var h = 0; h < 4; h++) { var U = Z.slice(h).concat(Z.slice(0, h)), df = ang(U[1], U[2], U[3]) - ang(U[2], U[3], U[0]); if (df > bd) { bd = df; T = U; } } }); var A = T[0], B = T[1], C = T[2], Dd = T[3], Cg = ang(B, C, Dd), lam = 0.45, E, F, G;
    for (var k = 0; k < 12; k++, lam /= 1.5) {
      E = lerp(Dd, A, lam); F = meet(E, sub(C, Dd), B, sub(C, B));
      var u = nr(sub(C, Dd)), w = rot(u, Cg); if (cr(u, w) * cr(u, sub(E, Dd)) < 0) w = rot(u, -Cg);
      G = meet(E, w, Dd, u);
      var tf = dt(sub(F, B), sub(C, B)) / dt(sub(C, B), sub(C, B)), tg = dt(sub(G, Dd), sub(C, Dd)) / dt(sub(C, Dd), sub(C, Dd));
      if (tf > 0 && tf < 1 && tg > 0 && tg < 0.9) break;
    }
    var pc = [[A, B, F, E]], m = n - 4, i;
    for (i = 0; i < m; i++) pc.push([lerp(G, E, i / m), lerp(C, F, i / m), lerp(C, F, (i + 1) / m), lerp(G, E, (i + 1) / m)]);
    var V3 = [E, Dd, G], l = [0, 1, 2].map(function (i) { return M.hypot.apply(null, sub(V3[(i + 1) % 3], V3[(i + 2) % 3])); }), p = l[0] + l[1] + l[2];
    var J = [(l[0] * E[0] + l[1] * Dd[0] + l[2] * G[0]) / p, (l[0] * E[1] + l[1] * Dd[1] + l[2] * G[1]) / p];
    var tp = [0, 1, 2].map(function (i) { var a = V3[(i + 1) % 3], b = V3[(i + 2) % 3], e = sub(b, a); return lerp(a, b, dt(sub(J, a), e) / dt(e, e)); });
    for (i = 0; i < 3; i++) pc.push([J, tp[(i + 2) % 3], V3[i], tp[(i + 1) % 3]]);
    return pc;
  }
  function cc(a, b, c) { var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A2 = dt(a, a), B2 = dt(b, b), C2 = dt(c, c); var o = [(A2 * (b[1] - c[1]) + B2 * (c[1] - a[1]) + C2 * (a[1] - b[1])) / d, (A2 * (c[0] - b[0]) + B2 * (a[0] - c[0]) + C2 * (b[0] - a[0])) / d]; return [o, M.hypot(a[0] - o[0], a[1] - o[1])]; }
  function S(p) { return [320 + p[0] * sc, 190 - p[1] * sc]; }
  V.buttons = [['Fewer pieces', function () { if (n > 4) n--; }], ['More pieces', function () { if (n < 9) n++; }], ['Circles on/off', function () { circ = !circ; }]];
  V.final = function () { };
  V.draw = function (c, L) {
    var pc = n === 4 ? pin() : big(), s = ci(320, 190, sc, 'none', c.axis, 1.5, '5 4'), fl = [c.blueSoft, c.orangeSoft, c.greenSoft, c.purpleSoft, c.goldSoft, c.tealSoft], cl = [c.blue, c.orange, c.green, c.purple, c.gold, c.teal], err = 0;
    pc.forEach(function (q, i) {
      s += pa(poly(q.map(S), 1), c.ink, 1.5, fl[i % 6]);
      var o = cc(q[0], q[1], q[2]); err = M.max(err, M.abs(M.hypot(q[3][0] - o[0][0], q[3][1] - o[0][1]) - o[1]));
      if (circ) { var z = S(o[0]); s += ci(z[0], z[1], o[1] * sc, 'none', cl[i % 6], 1.3); }
    });
    s += pa(poly(Q.map(S), 1), c.ink, 2.5);
    L('f', 320, 385, n + '\\text{ pieces, each with all four corners on its circle}' + (err < 1e-9 ? '' : '\\ (?)'), c.ink);
    return s;
  };
  V.cap = function () { return n === 4 ? 'Four pieces: segments from one inner point meet the four sides at the same angle, so each piece has two opposite angles adding to 180°.' : n + ' pieces: a cut parallel to one side, an isosceles trapezoid sliced into ' + (n - 4) + ' strip' + (n > 5 ? 's' : '') + ', and a small triangle split into three kites around its incenter.'; };
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
