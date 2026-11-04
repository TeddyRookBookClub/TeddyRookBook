/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1992-p4. */
(window.CompViz = window.CompViz || {})['imo-1992-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 420;
  V.aria = 'A circle resting on a line, with a fixed point M on the line. A point P moves up a ray. The tangents from P meet the line at Q and R, and M is always the midpoint of QR. The ray starts at the top point of the circle and points away from the reflection of the touching point in M.';
  var r = 55, m = 70, lam = 0.6, dir = 1, base = 360, cx = 300;
  function S(x, y) { return [cx + x, base - y]; }
  function geo() {
    var Ts = [0, 2 * r], Tp = [2 * m, 0], P = [Ts[0] + lam * (Ts[0] - Tp[0]), Ts[1] + lam * (Ts[1] - Tp[1])], O = [0, r];
    var dx = P[0] - O[0], dy = P[1] - O[1], d = M.hypot(dx, dy), th = M.acos(r / d), b = M.atan2(dy, dx), q = [];
    [1, -1].forEach(function (sg) { var tx0 = O[0] + r * M.cos(b + sg * th), ty0 = O[1] + r * M.sin(b + sg * th), k = P[1] / (P[1] - ty0); q.push([P[0] + k * (tx0 - P[0]), 0]); });
    q.sort(function (u, v) { return u[0] - v[0]; });
    return { Ts: Ts, Tp: Tp, P: P, Q: q[0], R: q[1] };
  }
  V.reset = function () { lam = 0.6; dir = 1; };
  V.advance = function (dt) { lam += dir * dt * 0.35; if (lam > 1.7) { lam = 1.7; dir = -1; } if (lam < 0.15) { lam = 0.15; dir = 1; } };
  V.step = function () { lam += 0.25; if (lam > 1.7) lam = 0.15; };
  V.final = function () { lam = 0.8; };
  V.buttons = [['M left', function () { m = M.max(-100, m - 25); }], ['M right', function () { m = M.min(100, m + 25); }]];
  V.draw = function (c, L) {
    var g = geo(), s = '', P = S(g.P[0], g.P[1]), Q = S(g.Q[0], 0), R = S(g.R[0], 0), T = S(0, 0), Ts = S(0, 2 * r), Tp = S(2 * m, 0), Mm = S(m, 0);
    s += ln(0, base, 640, base, c.axis, 2);
    var far = S(g.Ts[0] + 3 * (g.Ts[0] - g.Tp[0]), g.Ts[1] + 3 * (g.Ts[1] - g.Tp[1]));
    s += ln(Tp[0], Tp[1], Ts[0], Ts[1], c.muted, 1.5, '4 4') + ln(Ts[0], Ts[1], far[0], far[1], c.green, 4);
    s += pa(poly([P, Q, R], 1), c.blue, 2.5, c.blueSoft);
    var O = S(0, r); s += ci(O[0], O[1], r, 'none', c.ink, 2);
    s += ci(T[0], T[1], 4.5, c.ink) + ci(Tp[0], Tp[1], 4.5, c.orange) + ci(Ts[0], Ts[1], 4.5, c.green) + ci(Mm[0], Mm[1], 5.5, c.red) + ci(P[0], P[1], 5.5, c.blue) + ci(Q[0], Q[1], 4, c.blue) + ci(R[0], R[1], 4, c.blue);
    L('T', T[0], T[1] + 16, 'T', c.ink); L('Tp', Tp[0], Tp[1] + 16, "T'", c.orange); L('M', Mm[0], Mm[1] - 16, 'M', c.red); L('Ts', Ts[0] - 18, Ts[1] - 6, 'T^*', c.green);
    L('P', P[0] + 16, P[1] - 4, 'P', c.blue); L('Q', Q[0], Q[1] + 16, 'Q', c.blue); L('R', R[0], R[1] + 16, 'R', c.blue);
    L('f', 14, 404, '\\text{midpoint of }QR=' + ((g.Q[0] + g.R[0]) / 2 / 25).toFixed(2) + ',\\ \\ M=' + (m / 25).toFixed(2), c.ink, 'l');
    return s;
  };
  V.cap = function () { return "The green ray is the locus. T' is the reflection of T in M, where the excircle opposite P touches the line; P, T* and T' stay on one line."; };
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
