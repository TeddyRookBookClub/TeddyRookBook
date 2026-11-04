/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1999-p5. */
(window.CompViz = window.CompViz || {})['imo-1999-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'A large circle G containing two circles G1 and G2, each touching G from inside, at M and N. G1 passes through the center of G2. Their common chord line meets G at A and B; lines MA and MB meet G1 again at C and D, and the segment CD always touches G2.';
  var r2 = 0.55, Rr = 1.9, dir = 1, sc = 185 / 1.9, Oc = [0, 0];
  function geo() {
    var Ox = 1 - Rr + Rr * r2 - r2 * r2 / 2, Oy = M.sqrt(M.max(0, (Rr - 1) * (Rr - 1) - Ox * Ox)), O = [Ox, -Oy];
    var Mp = [-O[0] / (Rr - 1), -O[1] / (Rr - 1)], x0 = 1 - r2 * r2 / 2, dy = M.sqrt(M.max(0, Rr * Rr - (x0 - O[0]) * (x0 - O[0])));
    var A = [x0, O[1] + dy], B = [x0, O[1] - dy];
    function sec(Q) { var dx = Q[0] - Mp[0], dz = Q[1] - Mp[1], t = -2 * (Mp[0] * dx + Mp[1] * dz) / (dx * dx + dz * dz); return [Mp[0] + t * dx, Mp[1] + t * dz]; }
    var Nn = [O[0] + (1 - O[0]) * Rr / (Rr - r2), O[1] + (0 - O[1]) * Rr / (Rr - r2)];
    return { O: O, M: Mp, N: Nn, A: A, B: B, C: sec(A), D: sec(B), x0: x0 };
  }
  function S(p) { return [320 + (p[0] - Oc[0]) * sc, 200 - (p[1] - Oc[1]) * sc]; }
  V.reset = function () { r2 = 0.55; dir = 1; };
  V.advance = function (dt) { r2 += dir * dt * 0.12; if (r2 > 0.85) { r2 = 0.85; dir = -1; } if (r2 < 0.35) { r2 = 0.35; dir = 1; } };
  V.step = function () { r2 += 0.1; if (r2 > 0.85) r2 = 0.35; };
  V.final = function () { r2 = 0.55; };
  V.draw = function (c, L) {
    var g = geo(); Oc = g.O; var s = '', O = S(g.O), O1 = S([0, 0]), O2 = S([1, 0]);
    s += ci(O[0], O[1], Rr * sc, 'none', c.axis, 2) + ci(O1[0], O1[1], sc, 'none', c.blue, 2.5) + ci(O2[0], O2[1], r2 * sc, 'none', c.orange, 2.5);
    var A = S(g.A), B = S(g.B), C = S(g.C), D = S(g.D), Mm = S(g.M), Nn = S(g.N);
    s += ln(A[0], A[1], B[0], B[1], c.purple, 1.5, '6 4') + ln(Mm[0], Mm[1], A[0], A[1], c.muted, 1.5) + ln(Mm[0], Mm[1], B[0], B[1], c.muted, 1.5);
    s += ln(C[0], C[1], D[0], D[1], c.red, 3);
    var ex = g.D[0] - g.C[0], ey = g.D[1] - g.C[1], el = M.hypot(ex, ey), tt = ((1 - g.C[0]) * ex + (0 - g.C[1]) * ey) / (el * el), F = [g.C[0] + tt * ex, g.C[1] + tt * ey], dist = M.hypot(F[0] - 1, F[1]), Tt = S(F); s += ln(O2[0], O2[1], Tt[0], Tt[1], c.orange, 1.5, '3 3') + ci(Tt[0], Tt[1], 4, c.red);
    [['M', Mm, c.blue, -16, 0], ['N', Nn, c.orange, 16, 0], ['A', A, c.purple, 0, -14], ['B', B, c.purple, 0, 14], ['C', C, c.red, -6, -14], ['D', D, c.red, -6, 14], ['O_2', O2, c.orange, 14, -10]].forEach(function (q) { s += ci(q[1][0], q[1][1], 4.5, q[2]); L(q[0], q[1][0] + q[3], q[1][1] + q[4], q[0], q[2]); });
    s += ci(O1[0], O1[1], 3, c.blue);
    L('G', O[0] - Rr * sc * 0.74, O[1] + Rr * sc * 0.74, 'G', c.axis); L('G1', O1[0] - sc * 0.75, O1[1] - sc * 0.75, 'G_1', c.blue);
    L('f', 626, 408, '\\text{dist}(O_2,CD)=' + dist.toFixed(3) + ',\\ \\ r_2=' + r2.toFixed(3), c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'G₁ (blue, radius 1) passes through the center of G₂ (orange). As G₂ changes size, CD (red) stays a vertical chord at distance r₂ from O₂, so it always touches G₂.'; };
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
