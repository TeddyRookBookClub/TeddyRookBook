/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1988-p1. */
(window.CompViz = window.CompViz || {})['imo-1988-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 400;
  V.aria = 'Two circles with a common center O. A fixed point P on the small circle; a chord BC of the large circle through P turns around P, and A is where the perpendicular at P meets the small circle again. The sum of the squared sides of triangle ABC stays the same, and the midpoint of BC runs around the circle with diameter OP.';
  var Rb = 160, rs = 82, cx = 320, cy = 200, ang = 0.6, pth = 2.3, trail = [];
  function pts() {
    var P = [rs * M.cos(pth), rs * M.sin(pth)], u = [M.cos(ang), M.sin(ang)], v = [-u[1], u[0]];
    var a = P[0] * u[0] + P[1] * u[1], b = P[0] * v[0] + P[1] * v[1], d = M.sqrt(a * a - (rs * rs - Rb * Rb));
    var s1 = -a + d, s2 = -a - d, t = -2 * b;
    return { P: P, B: [P[0] + s1 * u[0], P[1] + s1 * u[1]], C: [P[0] + s2 * u[0], P[1] + s2 * u[1]], A: [P[0] + t * v[0], P[1] + t * v[1]], Mi: [P[0] - a * u[0], P[1] - a * u[1]] };
  }
  function d2(p, q) { return (p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]); }
  function S(p) { return [cx + p[0], cy - p[1]]; }
  V.reset = function () { ang = 0.6; trail = []; };
  V.advance = function (dt) { ang += dt * 0.6; trail.push(pts().Mi); if (ang > 0.6 + M.PI) return false; };
  V.done = function () { return ang > 0.6 + M.PI; };
  V.final = function () { trail = []; for (var i = 0; i <= 120; i++) { ang = 0.6 + M.PI * i / 120; trail.push(pts().Mi); } ang = 1.25; };
  V.step = function () { var e = ang + M.PI / 8; while (ang < e) { ang += 0.02; trail.push(pts().Mi); } };
  V.buttons = [['Move P', function () { pth += 0.7; V.reset(); }]];
  V.draw = function (c, L) {
    var g = pts(), s = '', O = [cx, cy], P = S(g.P), A = S(g.A), B = S(g.B), C = S(g.C), Mi = S(g.Mi);
    s += ci(cx, cy, Rb, 'none', c.axis, 1.5) + ci(cx, cy, rs, 'none', c.axis, 1.5);
    var hp = S([g.P[0] / 2, g.P[1] / 2]); s += ci(hp[0], hp[1], rs / 2, 'none', c.green, 1.5, '5 4');
    s += pa(poly([A, B, C], 1), c.blue, 2.5, c.blueSoft) + ln(P[0], P[1], A[0], A[1], c.muted, 1.5, '4 3');
    if (trail.length > 1) s += pa(poly(trail.map(S)), c.green, 3);
    s += ci(O[0], O[1], 3.5, c.ink) + ci(P[0], P[1], 5, c.red) + ci(Mi[0], Mi[1], 5, c.green);
    [A, B, C].forEach(function (q) { s += ci(q[0], q[1], 4.5, c.blue); });
    function off(q, k) { var dx = q[0] - cx, dy = q[1] - cy, d = M.hypot(dx, dy) || 1; return [q[0] + dx / d * k, q[1] + dy / d * k]; }
    var la = off(A, 14), lb = off(B, 14), lc = off(C, 14), lp = off(P, -16);
    L('O', cx - 12, cy + 14, 'O', c.ink); L('P', lp[0], lp[1], 'P', c.red); L('A', la[0], la[1], 'A', c.blue); L('B', lb[0], lb[1], 'B', c.blue); L('C', lc[0], lc[1], 'C', c.blue);
    var sum = d2(g.A, g.B) + d2(g.B, g.C) + d2(g.C, g.A), sc = 1 / 40;
    L('s', 14, 384, 'AB^2+BC^2+CA^2=' + (sum * sc * sc).toFixed(1) + '\\quad 6R^2+2r^2=' + ((6 * Rb * Rb + 2 * rs * rs) * sc * sc).toFixed(1), c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Lengths measured with R = 4 and r = 2.05. The green dashed circle has diameter OP; the midpoint of BC (green dot) stays on it.'; };
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
