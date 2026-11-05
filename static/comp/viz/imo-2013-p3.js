/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2013-p3. */
(window.CompViz = window.CompViz || {})['imo-2013-p3'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 380, aria: '' };
  var st = 0, NST = 2;
  V.reset = function () { st = 0; }; V.step = function () { st = M.min(NST, st + 1); }; V.back = function () { st = M.max(0, st - 1); }; V.final = function () { st = NST; };
  function PL(P, q, nm, c, o, k) { var p = P(q); o = o || [0, -11]; return dot(p, k || c.ink, 3.6) + tx([p[0] + o[0], p[1] + o[1] + 5], nm, k || c.ink, 14, 'middle', 600); }
  function LN(P, a, b, k, w, da) { return ln(P(a), P(b), k, w || 2, da); }
  function U(t) { return [M.cos(t), M.sin(t)]; }
  V.aria = 'Triangle ABC in its circumcircle with the excircle touch points A1, B1, C1 on the sides, the circle through them with center Q, and the arc midpoint A0. As the angle at A approaches ninety degrees, Q moves onto the circumcircle at A0.';
  var th = 380;
  V.sliders = [['vertex C', 250, 440, 1, function () { return th; }, function (v) { th = v; }]];
  var CAPS = ['A\u2081, B\u2081, C\u2081 are where the excircles touch the sides. Q is the center of the circle through them. Move C.',
    'A\u2080 is the midpoint of arc BAC. It is equally far from B\u2081 and C\u2081, so it lies on the perpendicular bisector of B\u2081C\u2081.',
    'A\u2080A\u2081\u00b2 \u2212 A\u2080B\u2081\u00b2 = bc\u00b7cos A. So Q = A\u2080 exactly when the angle at A is right; then Q is on the circle.'];
  V.draw = function (c, L) {
    var A = U(M.PI / 2), B = U(210 * M.PI / 180), C = U(th * M.PI / 180);
    var a = G.dist(B, C), b = G.dist(C, A), cc = G.dist(A, B), s2 = (a + b + cc) / 2;
    function on(P, Q, d, l) { return G.add(P, G.mul(G.sub(Q, P), d / l)); }
    var A1 = on(B, C, s2 - cc, a), B1 = on(C, A, s2 - a, b), C1 = on(A, B, s2 - b, cc), K = G.circ(A1, B1, C1);
    var mA = G.mul(G.add(B, C), 0.5), n = [-(C[1] - B[1]), C[0] - B[0]]; n = G.mul(n, 1 / G.len(n)); if (G.dt(G.sub(A, mA), n) < 0) n = G.mul(n, -1);
    var A0 = n, angA = M.acos(G.dt(G.sub(B, A), G.sub(C, A)) / (b * cc)) * 180 / M.PI;
    var T = fitter([[-1.1, -1.1], [1.1, 1.1], [K.o[0] + K.r, K.o[1]], [K.o[0] - K.r, K.o[1]], [K.o[0], K.o[1] + K.r], [K.o[0], K.o[1] - K.r]].filter(function (p) { return G.len(p) < 3; }), 20, 16, 620, 364), s = '';
    s += ci(T([0, 0]), T.s, null, c.blue, 1.6) + pa(poly([T(A), T(B), T(C)], 1), c.ink, 2);
    s += pa(poly([T(A1), T(B1), T(C1)], 1), c.teal, 1.8) + ci(T(K.o), K.r * T.s, null, c.purple, 1.8);
    if (st >= 1) { var mid = G.mid(B1, C1); s += LN(T, A0, G.add(mid, G.mul(G.sub(mid, A0), 0.6)), c.gold, 1.8, '6 4') + LN(T, A0, B1, c.gold, 1.2) + LN(T, A0, C1, c.gold, 1.2) + PL(T, A0, 'A₀', c, [14, -6], c.gold); }
    if (st >= 2) s += LN(T, A0, A1, c.red, 1.6);
    s += PL(T, K.o, 'Q', c, [12, 0], c.purple);
    [[A, 'A', [0, -12]], [B, 'B', [-13, 6]], [C, 'C', [13, 6]], [A1, 'A₁', [0, 18]], [B1, 'B₁', [14, 0]], [C1, 'C₁', [-15, 0]]].forEach(function (q) { s += PL(T, q[0], q[1], c, q[2]); });
    var oq = G.len(K.o);
    L('f', 16, 20, '\\angle A\\approx' + angA.toFixed(0) + '^\\circ', c.ink, 'l');
    L('n', 624, 20, 'OQ/R\\approx' + oq.toFixed(3), M.abs(oq - 1) < 0.004 ? c.red : c.ink, 'r');
    L('g', 624, 360, st >= 2 ? 'A_0A_1^2-A_0B_1^2=bc\\cos A\\approx' + (G.dist(A0, A1) * G.dist(A0, A1) - G.dist(A0, B1) * G.dist(A0, B1)).toFixed(3) : '', c.ink, 'r');
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
