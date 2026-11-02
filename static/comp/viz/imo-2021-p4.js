/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-2021-p4. */
(window.CompViz = window.CompViz || {})['imo-2021-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 470;
  V.aria = 'A quadrilateral ABCD with an inscribed circle centered at I, and the circle through A, I and C. Its second meetings with the extended sides give X, Y, Z and T. The chords IX and IY are equal, as are IZ and IT, and the reflection in the diameter through I swaps X with Y and Z with T.';
  var st = 0, N = 5, ang = [2.75, 5.15, 6.55, 7.35];
  function sub(p, q) { return [p[0] - q[0], p[1] - q[1]]; } function add(p, q) { return [p[0] + q[0], p[1] + q[1]]; } function mul(p, k) { return [p[0] * k, p[1] * k]; }
  function len(p) { return M.hypot(p[0], p[1]); } function cr(a, b) { return a[0] * b[1] - a[1] * b[0]; } function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  function inter(p, r, q, s) { var t = cr(sub(q, p), s) / cr(r, s); return add(p, mul(r, t)); }
  function circ(a, b, c) { var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A2 = dot(a, a), B2 = dot(b, b), C2 = dot(c, c);
    var o = [(A2 * (b[1] - c[1]) + B2 * (c[1] - a[1]) + C2 * (a[1] - b[1])) / d, (A2 * (c[0] - b[0]) + B2 * (a[0] - c[0]) + C2 * (b[0] - a[0])) / d]; return [o, len(sub(a, o))]; }
  function second(o, R, p, d) { var u = mul(d, 1 / len(d)), t = -2 * dot(sub(p, o), u); return add(p, mul(u, t)); }
  var tp = ang.map(function (a) { return [M.cos(a), M.sin(a)]; }), V4 = [];
  for (var i = 0; i < 4; i++) { var p = tp[(i + 3) % 4], q = tp[i]; V4.push(inter(p, [-p[1], p[0]], q, [-q[1], q[0]])); }
  var A = V4[0], B = V4[1], C = V4[2], Dd = V4[3], I = [0, 0], Om = circ(A, I, C), o = Om[0], R = Om[1];
  var X = second(o, R, A, sub(A, B)), Z = second(o, R, C, sub(C, B)), Y = second(o, R, A, sub(Dd, A)), T = second(o, R, C, sub(Dd, C));
  var pts = [A, B, C, Dd, X, Y, Z, T, add(o, [R, R]), sub(o, [R, R])], x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  pts.forEach(function (q) { x0 = M.min(x0, q[0]); x1 = M.max(x1, q[0]); y0 = M.min(y0, q[1]); y1 = M.max(y1, q[1]); });
  var sc = M.min(600 / (x1 - x0), (V.H - 70) / (y1 - y0)) * 0.92, ox = 320 - sc * (x0 + x1) / 2, oy = 50 + (V.H - 60) / 2 + sc * (y0 + y1) / 2;
  function Zp(p) { return [ox + p[0] * sc, oy - p[1] * sc]; }
  function L2(a, b, k, w, da) { a = Zp(a); b = Zp(b); return ln(a[0], a[1], b[0], b[1], k, w, da); }
  function tang(P, side) { var q = tp[side]; return q; }
  V.reset = function () { st = 0; };
  V.step = function () { st = (st + 1) % N; };
  V.back = function () { st = (st + N - 1) % N; };
  V.final = function () { st = N - 1; };
  V.draw = function (c, Lb) {
    var s = '', Ip = Zp(I), Op = Zp(o);
    s += pa(poly([Zp(A), Zp(B), Zp(C), Zp(Dd)], 1), c.ink, 2) + ci(Ip[0], Ip[1], sc, c.greenSoft, c.green, 2);
    if (st >= 1) {
      s += ci(Op[0], Op[1], R * sc, null, c.purple, 2) + L2(B, X, c.muted, 1.5, '5 4') + L2(B, Z, c.muted, 1.5, '5 4') + L2(A, Y, c.muted, 1.5, '5 4') + L2(C, T, c.muted, 1.5, '5 4');
    }
    if (st >= 2) s += L2(I, X, c.orange, 3) + L2(I, Y, c.orange, 3) + L2(I, Z, c.blue, 3) + L2(I, T, c.blue, 3);
    if (st >= 3) { var u = sub(o, I), e1 = add(I, mul(u, -0.4)), e2 = add(I, mul(u, 2.4)); s += L2(e1, e2, c.gold, 1.5, '8 5') + L2(T, X, c.red, 3) + L2(Y, Z, c.red, 3); }
    if (st >= 4) { s += L2(X, tp[0], c.teal, 4) + L2(Y, tp[3], c.teal, 4) + L2(Z, tp[1], c.pink, 4) + L2(T, tp[2], c.pink, 4); tp.forEach(function (q) { var z = Zp(q); s += ci(z[0], z[1], 3, c.ink); }); }
    var lab = [['A', A], ['B', B], ['C', C], ['D', Dd], ['I', I]]; if (st >= 1) lab.push(['X', X], ['Y', Y], ['Z', Z], ['T', T]);
    lab.forEach(function (q) { var z = Zp(q[1]), d = sub(q[1], q[0] === 'I' ? [0.3, -0.5] : o), dl = len(d) || 1; s += ci(z[0], z[1], 3.5, c.ink); Lb('p' + q[0], z[0] + d[0] / dl * 15, z[1] - d[1] / dl * 15, q[0], c.ink); });
    var m = [['\\Gamma\\ \\text{(center } I)\\ \\text{touches all four sides}', c.green], ['\\Omega=(AIC)\\ \\text{meets the extended sides at } X,Y,Z,T', c.purple], ['IX=IY,\\qquad IZ=IT', c.orange], ['\\text{mirror in the diameter through } I:\\ TX=YZ', c.red], ['XA+a=YD+d,\\quad ZC+c=TD+d', c.teal]][st];
    Lb('m', 16, 22, m[0], m[1], 'l');
    return s;
  };
  V.cap = function () { return 'Step ' + (st + 1) + ' of ' + N + '. ' + ['A quadrilateral with an inscribed circle.', 'The circle through A, I and C, and the four extended sides.', 'Equal inscribed angles at A (and at C) give equal chords from I.', 'Points at equal distance from I are mirror images in the diameter through I.', 'Equal distances from I mean equal tangent lengths to the inscribed circle (teal pair and pink pair).'][st]; };
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
