/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2008-p6. */
(window.CompViz = window.CompViz || {})['imo-2008-p6'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  var st = 0, NST = 0;
  function stepper(n) { NST = n; V.reset = function () { st = 0; }; V.step = function () { st = M.min(NST, st + 1); }; V.back = function () { st = M.max(0, st - 1); }; V.final = function () { st = NST; }; }
  function PL(P, q, nm, c, o) { var p = P(q); o = o || [0, -11]; return dot(p, c.ink, 3.6) + tx([p[0] + o[0], p[1] + o[1] + 5], nm, c.ink, 14, 'middle', 600); }
  function AU(P, q, ctr, nm, c) { var p = P(q), r = P(ctr), d = G.sub(p, r), l = G.len(d) || 1; return PL(P, q, nm, c, [d[0] / l * 15, d[1] / l * 15]); }
  function CC(P, o, r, k, w, da) { return ci(P(o), r * P.s, null, k, w || 2, da); }
  function LN(P, a, b, k, w, da) { return ln(P(a), P(b), k, w || 2, da); }
  function XL(P, a, b, t, k, w, da) { var d = G.sub(b, a); return ln(P(G.sub(a, G.mul(d, t))), P(G.add(b, G.mul(d, t))), k, w || 1.5, da); }
  function foot(p, a, b) { var d = G.sub(b, a); return G.add(a, G.mul(d, G.dt(G.sub(p, a), d) / G.dt(d, d))); }
  function unit(v) { return G.mul(v, 1 / G.len(v)); }
  function incen(A, B, C) { var a = G.dist(B, C), b = G.dist(A, C), c = G.dist(A, B), s = a + b + c; return [(a * A[0] + b * B[0] + c * C[0]) / s, (a * A[1] + b * B[1] + c * C[1]) / s]; }
  V.aria = 'A convex quadrilateral ABCD below a large circle omega that touches the extensions of all four sides. The incircles of triangles ABC and ADC touch AC at two points symmetric about its midpoint. A line through B and a line through D both pass through K, the lowest point of omega, and the two external common tangents of the incircles meet there.';
  var fa = 0.32, fc = 0.5, BETA = 1.8; stepper(4);
  var CAPS = ['ω touches lines AD and CD beyond D. Equal tangent lengths give AB + AD = CB + CD.',
    'So the incircles ω₁ and ω₂ touch AC at T₁ and T₂, mirror images in the midpoint of AC.',
    'Homotheties at B: the lowest point T₁′ of ω₁, the point T₂ and the lowest point K of ω lie on one line through B.',
    'Homotheties at D: the highest point T₂′ of ω₂, the point T₁ and K lie on one line through D.',
    'Both lines pass through the external center of ω₁ and ω₂, so that center is K. The external tangents meet on ω.'];
  var F = ['AB+AD=CB+CD', 'AT_1=CT_2', 'B,\\ T_1\',\\ T_2,\\ K\\ \\text{collinear}', 'D,\\ T_2\',\\ T_1,\\ K\\ \\text{collinear}', '\\text{external center}=K\\in\\omega'];
  V.sliders = [['A', 20, 42, 1, function () { return M.round(fa * 100); }, function (v) { fa = v / 100; }]];
  function tps(P) { var d = G.len(P), a = M.atan2(P[1], P[0]), t = M.acos(1 / d); return [G.dir(a + t), G.dir(a - t)]; }
  function oth(P, T) { var s = tps(P); return G.dist(s[0], T) > G.dist(s[1], T) ? s[0] : s[1]; }
  function inr(A, B, C) { var I = incen(A, B, C), a = G.dist(B, C), b = G.dist(C, A), c = G.dist(A, B), ar = M.abs(G.cr(G.sub(B, A), G.sub(C, A))) / 2; return [I, 2 * ar / (a + b + c)]; }
  V.draw = function (c, L) {
    var B = [0, -BETA], T = tps(B), A = G.add(B, G.mul(G.sub(T[1], B), fa)), C = G.add(B, G.mul(G.sub(T[0], B), fc));
    var RA = oth(A, T[1]), RC = oth(C, T[0]), Dp = G.meet(A, G.sub(RA, A), C, G.sub(RC, C));
    var w1 = inr(A, B, C), w2 = inr(A, Dp, C), e = unit(G.sub(C, A)), u = [-e[1], e[0]];
    if (G.dt(G.sub(B, A), u) > 0) u = G.mul(u, -1);
    var K = G.mul(u, -1), T1 = G.add(w1[0], G.mul(u, w1[1])), T1p = G.sub(w1[0], G.mul(u, w1[1])), T2 = G.sub(w2[0], G.mul(u, w2[1])), T2p = G.add(w2[0], G.mul(u, w2[1]));
    var P = fitter([A, B, C, Dp, K, G.add(K, G.mul(u, 0.12))], 30, 26, 610, 300), s = '';
    s += CC(P, [0, 0], 1, c.blue, 2.5) + XL(P, B, A, 0.15, c.muted, 1) + XL(P, B, C, 0.15, c.muted, 1) + XL(P, A, Dp, 0.4, c.muted, 1) + XL(P, C, Dp, 0.4, c.muted, 1);
    s += pa(poly([P(A), P(B), P(C), P(Dp)], 1), c.ink, 2) + LN(P, A, C, c.ink, 1.5);
    s += CC(P, w1[0], w1[1], c.teal, 2) + CC(P, w2[0], w2[1], c.orange, 2);
    if (st >= 1) s += PL(P, T1, '', c) + PL(P, T2, '', c) + PL(P, G.mid(A, C), '', c);
    if (st >= 2) s += LN(P, B, K, c.purple, 2) + PL(P, T1p, '', c) + PL(P, K, '', c);
    if (st >= 3) s += LN(P, Dp, T1, c.red, 2) + LN(P, Dp, K, c.red, 2) + PL(P, T2p, '', c);
    if (st >= 4) [[w1, 1], [w1, -1]].forEach(function (q) { var d = G.sub(K, w1[0]), dd = G.len(d), ph = M.atan2(d[1], d[0]) + q[1] * M.acos(w1[1] / dd), p1 = G.add(w1[0], G.mul(G.dir(ph), w1[1])); s += LN(P, p1, G.add(K, G.mul(G.sub(K, p1), 0.25)), c.gold, 2); });
    if (st >= 4) s += ci(P(K), 7, null, c.gold, 2.5);
    var ctr = G.mul(G.add(G.add(A, B), G.add(C, Dp)), 0.25);
    [[A, 'A'], [B, 'B'], [C, 'C'], [Dp, 'D']].forEach(function (q) { s += AU(P, q[0], ctr, q[1], c); });
    if (st >= 1) s += tx(G.add(P(T1), [0, -9]), 'T₁', c.ink, 13) + tx(G.add(P(T2), [0, 18]), 'T₂', c.ink, 13);
    if (st >= 2) s += tx(G.add(P(T1p), [12, 10]), 'T₁′', c.ink, 13) + tx(G.add(P(K), [0, -10]), 'K', c.ink, 15, 'middle', 700);
    if (st >= 3) s += tx(G.add(P(T2p), [22, 4]), 'T₂′', c.ink, 13);
    s += tx(G.add(P(G.rot(K, 0.35)), [14, 4]), 'ω', c.blue, 16, 'start', 700) + tx(G.add(P(w1[0]), [0, 5]), 'ω₁', c.teal, 13) + tx(G.add(P(w2[0]), [0, 5]), 'ω₂', c.orange, 12);
    L('f', 20, 336, F[st], st >= 4 ? c.red : c.ink, 'l');
    return s;
  };
  V.cap = function () { return CAPS[st]; };
  /* ---- frame (shared by the IMO diagrams; each file is self-contained) ---- */
  function f1(n) { return (+n).toFixed(1); }
  function at(o) { var s = ''; for (var k in o) if (o[k] != null) s += ' ' + k + '="' + o[k] + '"'; return s; }
  function ln(p, q, k, w, da) { return '<line' + at({ x1: f1(p[0]), y1: f1(p[1]), x2: f1(q[0]), y2: f1(q[1]), stroke: k, 'stroke-width': w || 2, 'stroke-dasharray': da, 'stroke-linecap': 'round' }) + '/>'; }
  function ci(p, r, f, k, w, da) { return '<circle' + at({ cx: f1(p[0]), cy: f1(p[1]), r: f1(r), fill: f || 'none', stroke: k, 'stroke-width': k ? (w || 2) : null, 'stroke-dasharray': da }) + '/>'; }
  function pa(d, k, w, f, da) { return '<path' + at({ d: d, fill: f || 'none', stroke: k, 'stroke-width': k ? (w || 2) : null, 'stroke-dasharray': da, 'stroke-linejoin': 'round' }) + '/>'; }
  function re(x, y, w, h, f, k, r) { return '<rect' + at({ x: f1(x), y: f1(y), width: f1(w), height: f1(h), rx: r || 0, fill: f, stroke: k, 'stroke-width': k ? 1.5 : null }) + '/>'; }
  function tx(p, s, k, sz, an, wt) { return '<text' + at({ x: f1(p[0]), y: f1(p[1]), fill: k, 'font-size': sz || 15, 'text-anchor': an || 'middle', 'font-weight': wt, 'font-family': 'system-ui,sans-serif' }) + '>' + s + '</text>'; }
  function poly(p, z) { var s = ''; for (var i = 0; i < p.length; i++) s += (i ? 'L' : 'M') + f1(p[i][0]) + ' ' + f1(p[i][1]); return s + (z ? 'Z' : ''); }
  function dot(p, k, r) { return ci(p, r || 4.5, k); }
  // plane geometry on [x, y] pairs
  var G = {
    add: function (a, b) { return [a[0] + b[0], a[1] + b[1]]; }, sub: function (a, b) { return [a[0] - b[0], a[1] - b[1]]; },
    mul: function (a, t) { return [a[0] * t, a[1] * t]; }, mid: function (a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; },
    len: function (a) { return M.sqrt(a[0] * a[0] + a[1] * a[1]); }, dist: function (a, b) { return G.len(G.sub(a, b)); },
    cr: function (a, b) { return a[0] * b[1] - a[1] * b[0]; }, dt: function (a, b) { return a[0] * b[0] + a[1] * b[1]; },
    dir: function (t) { return [M.cos(t), M.sin(t)]; },
    rot: function (v, t) { return [v[0] * M.cos(t) - v[1] * M.sin(t), v[0] * M.sin(t) + v[1] * M.cos(t)]; },
    meet: function (p, d, q, e) { var t = G.cr(G.sub(q, p), e) / G.cr(d, e); return G.add(p, G.mul(d, t)); },
    circ: function (a, b, c) { var d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1])), A = G.dt(a, a), B = G.dt(b, b), C = G.dt(c, c);
      var o = [(A * (b[1] - c[1]) + B * (c[1] - a[1]) + C * (a[1] - b[1])) / d, (A * (c[0] - b[0]) + B * (a[0] - c[0]) + C * (b[0] - a[0])) / d]; return { o: o, r: G.dist(o, a) }; },
    lc: function (p, d, o, r) { var a = G.dt(d, d), b = 2 * G.dt(d, G.sub(p, o)), c = G.dt(G.sub(p, o), G.sub(p, o)) - r * r, D = b * b - 4 * a * c;
      if (D < 0) return []; D = M.sqrt(D); return [G.add(p, G.mul(d, (-b - D) / (2 * a))), G.add(p, G.mul(d, (-b + D) / (2 * a)))]; },
    other: function (p, d, o, r, known) { var s = G.lc(p, d, o, r); if (!s.length) return null; return G.dist(s[0], known) > G.dist(s[1], known) ? s[0] : s[1]; },
    refl: function (p, a, d) { var u = G.mul(d, 1 / G.len(d)), v = G.sub(p, a), t = G.dt(v, u); return G.sub(G.add(a, G.mul(u, 2 * t)), v); }
  };
  // fit math points (y up) into the drawing area
  function fitter(pts, x0, y0, x1, y1) {
    var a = 1e9, b = -1e9, c = 1e9, d = -1e9; pts.forEach(function (p) { a = M.min(a, p[0]); b = M.max(b, p[0]); c = M.min(c, p[1]); d = M.max(d, p[1]); });
    var s = M.min((x1 - x0) / (b - a || 1), (y1 - y0) / (d - c || 1)), ox = (x0 + x1) / 2 - s * (a + b) / 2, oy = (y0 + y1) / 2 + s * (c + d) / 2;
    var f = function (p) { return [ox + s * p[0], oy - s * p[1]]; }; f.s = s; return f;
  }
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
    seen[key] = 1; var o = labs[key];
    if (!o) { o = labs[key] = { d: D.createElement('div'), s: null }; lay.appendChild(o.d); }
    o.d.style.cssText = 'position:absolute;left:' + (x / W * 100) + '%;top:' + (y / V.H * 100) + '%;transform:translate(' + (an === 'l' ? '0' : an === 'r' ? '-100%' : '-50%') + ',-50%);font-size:clamp(10px,2.3vw,15px);white-space:nowrap;line-height:1.2;padding:0 3px;border-radius:4px;background:' + lbg + ';color:' + (col || 'inherit') + (s ? '' : ';display:none');
    if (o.s !== s) { o.s = s; if (s) api.tex(s, o.d); else o.d.innerHTML = ''; }
  }
  function btn(t, f) { var b = D.createElement('button'); b.type = 'button'; b.className = 'cp-btn'; b.textContent = t; b.addEventListener('click', f); bar.appendChild(b); return b; }
  (V.sliders || []).forEach(function (s) {
    var lab = D.createElement('label'); lab.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:.9em;min-height:40px';
    var inp = D.createElement('input'); inp.type = 'range'; inp.min = s[1]; inp.max = s[2]; inp.step = s[3]; inp.value = s[4](); inp.style.width = '120px';
    inp.setAttribute('aria-label', s[0]); lab.appendChild(D.createTextNode(s[0])); lab.appendChild(inp); bar.appendChild(lab);
    inp.addEventListener('input', function () { s[5](+inp.value); render(); });
  });
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
  if (V.reset) btn('Reset', function () { stop(); V.reset(); render(); });
  (V.buttons || []).forEach(function (b) { btn(b[0], function () { stop(); b[1](); render(); }); });
  api.onTheme(render);
  if (V.reset) V.reset();
  if (!V.advance || api.reduced()) { if (V.final) V.final(); render(); } else { render(); play(); }
};
