/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1967-p4. */
(window.CompViz = window.CompViz || {})['imo-1967-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 420, aria: '' };
  V.aria = 'A small acute triangle with a family of larger triangles of one fixed shape around it, each side passing through one of its corners. Each corner of the big triangle runs on a circle; all three circles pass through one point M. The largest member has its corners opposite M on the circles.';
  var R = M.PI / 180, ang = [55 * R, 65 * R, 60 * R], P0 = [[0.05, -0.62], [0.62, 0.28], [-0.52, 0.22]];
  var ph = 0, dir = 1, lo = 0, hi = 0, sc = 135;
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function cr(a, b) { return a[0] * b[1] - a[1] * b[0]; }
  function center(i) {
    var P = P0[(i + 1) % 3], Q = P0[(i + 2) % 3], m = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2], d = sub(Q, P), L = M.hypot(d[0], d[1]), n = [-d[1] / L, d[0] / L];
    if ((P0[i][0] - m[0]) * n[0] + (P0[i][1] - m[1]) * n[1] > 0) n = [-n[0], -n[1]];
    var t = L / 2 / M.tan(ang[i]); return [m[0] + t * n[0], m[1] + t * n[1]];
  }
  var O = [0, 1, 2].map(center);
  var dd = sub(O[2], O[1]), f = ((P0[0][0] - O[1][0]) * dd[0] + (P0[0][1] - O[1][1]) * dd[1]) / (dd[0] * dd[0] + dd[1] * dd[1]);
  var Mp = [2 * (O[1][0] + f * dd[0]) - P0[0][0], 2 * (O[1][1] + f * dd[1]) - P0[0][1]];
  var Ts = O.map(function (o) { return [2 * o[0] - Mp[0], 2 * o[1] - Mp[1]]; });
  function tri(p) { var c = M.cos(p), s = M.sin(p); return Ts.map(function (X) { var v = sub(X, Mp); return [Mp[0] + c * (c * v[0] - s * v[1]), Mp[1] + c * (s * v[0] + c * v[1])]; }); }
  function onseg(P, A, B) { var d = sub(B, A), t = ((P[0] - A[0]) * d[0] + (P[1] - A[1]) * d[1]) / (d[0] * d[0] + d[1] * d[1]); return t >= -1e-9 && t <= 1 + 1e-9; }
  function ok(p) { var T = tri(p); return onseg(P0[0], T[1], T[2]) && onseg(P0[1], T[2], T[0]) && onseg(P0[2], T[0], T[1]); }
  for (var p = -88 * R; p <= 88 * R; p += 0.25 * R) if (ok(p)) { if (!lo) lo = p; hi = p; }
  function S(q) { return [320 + q[0] * sc, 205 - q[1] * sc]; }
  V.reset = function () { ph = lo; dir = 1; };
  V.advance = function (dt) { ph += dir * dt * 0.35; if (ph > hi) { ph = hi; dir = -1; } if (ph < lo) { ph = lo; dir = 1; } };
  V.step = function () { ph += (hi - lo) / 8; if (ph > hi + 1e-9) ph = lo; };
  V.final = function () { ph = lo + 0.3 * (hi - lo); };
  V.buttons = [['Show the largest', function () { ph = 0; }]];
  V.draw = function (c, L) {
    var s = '', T = tri(ph).map(S), Tm = Ts.map(S), m = S(Mp), A0 = P0.map(S), col = [c.purple, c.teal, c.orange];
    for (var i = 0; i < 3; i++) { var o = S(O[i]); s += ci(o[0], o[1], M.hypot(O[i][0] - Mp[0], O[i][1] - Mp[1]) * sc, 'none', col[i], 1.2, '4 4'); }
    s += pa(poly(Tm, 1), c.muted, 1.5, 'none', '7 5');
    s += pa(poly(T, 1), c.blue, 2.5, c.blueSoft);
    s += pa(poly(A0, 1), c.green, 2, c.greenSoft);
    var nm = ['A', 'B', 'C'];
    for (i = 0; i < 3; i++) { s += ci(T[i][0], T[i][1], 4.5, col[i]) + ci(A0[i][0], A0[i][1], 4, c.green); L('v' + i, T[i][0], T[i][1] - 15, nm[i], col[i]); L('w' + i, A0[i][0] + (i === 0 ? 0 : i === 1 ? 20 : -20), A0[i][1] + (i === 0 ? 16 : 0), nm[i] + '_0', c.green); }
    s += ci(m[0], m[1], 4, c.red); L('M', m[0] + 14, m[1] - 4, 'M', c.red);
    var a = M.cos(ph) * M.cos(ph), bw = 200;
    s += re(420, 392, bw, 12, c.grid) + re(420, 392, bw * a, 12, c.blue);
    L('f', 412, 398, '\\text{area}/\\text{max} = ' + a.toFixed(3), c.ink, 'r');
    return s;
  };
  V.cap = function () { return 'Every blue triangle has the same shape and passes through A₀, B₀, C₀. Its corners ride on the three dashed circles through M. The area is largest (gray dashed outline) when each corner is opposite M on its circle.'; };
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
