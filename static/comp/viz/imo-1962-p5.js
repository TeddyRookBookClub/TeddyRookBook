/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-1962-p5. */
(window.CompViz = window.CompViz || {})['imo-1962-p5'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 400;
  V.aria = 'Three points A, B, C on a circle. Step by step: extend CB to P with BP equal to BA, draw the circle through A, P, C, cut it with the circle about A of radius AB minus BC to get E, and extend AE to meet the circle at D. The quadrilateral ABCD then has an inscribed circle.';
  var beta = 1.9, idx = 4, NS_ = 4;
  V.sliders = [['B', -0.3, 3.4, 0.01, function () { return beta; }, function (v) { beta = v; }]];
  V.reset = function () { idx = 0; }; V.final = function () { idx = NS_; };
  V.step = function () { if (idx < NS_) idx++; }; V.back = function () { if (idx > 0) idx--; };
  V.advance = function (dt) { V.t = (V.t || 0) + dt; if (V.t > 1.8) { V.t = 0; if (idx >= NS_) return false; idx++; } };
  V.done = function () { return idx >= NS_; };
  V.draw = function (c, L) {
    var f = fitter([[-1.15, -1.15], [1.15, 1.15]], 120, 15, 520, 385), s = '';
    var A = G.dir(3.665), C = G.dir(5.76), B = G.dir(beta), X = A, Z = C, nX = 'A', nZ = 'C';
    if (G.dist(A, B) < G.dist(C, B)) { X = C; Z = A; nX = 'C'; nZ = 'A'; }
    var XB = G.dist(X, B), dl = XB - G.dist(Z, B), P = G.add(B, G.mul(G.sub(B, Z), XB / G.dist(B, Z)));
    var Gm = G.circ(X, P, Z), side = function (p) { return G.cr(G.sub(Z, X), G.sub(p, X)); }, sb = side(B), E = null, Dp;
    if (dl > 1e-4) {
      var d = G.dist(Gm.o, X), aa = (dl * dl - Gm.r * Gm.r + d * d) / (2 * d), hh = M.sqrt(M.max(dl * dl - aa * aa, 0)), u = G.mul(G.sub(Gm.o, X), 1 / d), v = [-u[1], u[0]];
      E = [G.add(G.add(X, G.mul(u, aa)), G.mul(v, hh)), G.sub(G.add(X, G.mul(u, aa)), G.mul(v, hh))].filter(function (q) { return side(q) * sb < 0; })[0];
      var w = G.mul(G.sub(E, X), 1 / G.dist(E, X)); Dp = G.sub(X, G.mul(w, 2 * G.dt(X, w)));
    } else { Dp = G.mul(G.add(A, C), -1 / G.len(G.add(A, C))); if (G.dt(Dp, B) > 0) Dp = G.mul(Dp, -1); }
    s += ci(f([0, 0]), f.s, null, c.ink, 2);
    s += pa(poly([A, B, C].map(f)), c.ink, 2);
    if (idx >= 1) s += ln(f(B), f(P), c.gold, 2.5) + ln(f(X), f(P), c.gold, 1.5, '4 4') + dot(f(P), c.gold, 4) + tx(G.add(f(P), [0, -10]), 'P', c.gold, 14);
    if (idx >= 2 && E) s += ci(f(Gm.o), f.s * Gm.r, null, c.blue, 1.8, '6 4');
    if (idx >= 3 && E) s += ci(f(X), f.s * dl, null, c.green, 1.8) + dot(f(E), c.green, 5) + tx(G.add(f(E), [12, 4]), 'E', c.green, 14, 'start');
    if (idx >= 4) {
      var Q = [A, B, C, Dp]; s += pa(poly(Q.map(f), 1), c.red, 2.5, c.red + '14');
      if (E) s += ln(f(X), f(Dp), c.green, 1.5, '3 3');
      var bis = function (i) { var V0 = Q[i], U = Q[(i + 3) % 4], W2 = Q[(i + 1) % 4]; return G.add(G.mul(G.sub(U, V0), 1 / G.dist(U, V0)), G.mul(G.sub(W2, V0), 1 / G.dist(W2, V0))); };
      var I = G.meet(A, bis(0), B, bis(1)), ab = G.sub(B, A), r = M.abs(G.cr(ab, G.sub(I, A))) / G.len(ab);
      s += ci(f(I), f.s * r, null, c.red, 2) + dot(f(Dp), c.red, 5) + tx(G.add(f(Dp), [0, 20]), 'D', c.red, 15);
    }
    [[A, 'A', -14, 6], [B, 'B', 0, -12], [C, 'C', 14, 6]].forEach(function (q) { var p = f(q[0]); s += dot(p, c.ink, 4.5) + tx([p[0] + q[2], p[1] + q[3]], q[1], c.ink, 15); });
    var DA = G.dist(Dp, A), DC = G.dist(Dp, C);
    L('a', 8, 30, 'AB+CD=' + (G.dist(A, B) + DC).toFixed(3), c.ink, 'l');
    L('b', 8, 62, 'BC+DA=' + (G.dist(B, C) + DA).toFixed(3), c.ink, 'l');
    if (idx >= 1 && E) L('c', 632, 30, '\\angle ' + nX + 'P' + nZ + '=\\tfrac12\\angle B', c.gold, 'r'); else L('c', 0, 0, '');
    if (idx >= 3 && E) L('d', 632, 62, nX + 'E=' + nX + 'B-' + nZ + 'B', c.green, 'r'); else L('d', 0, 0, '');
    return s;
  };
  V.cap = function () {
    return ['Three points on a circle. Drag B with the slider.', 'Gold: extend the shorter side beyond B so that BP equals the longer side. The angle at P is half the angle at B.',
      'Blue: the circle through the two far points and P. On the far side it sees the chord under 180° − ½∠B.', 'Green: the circle of radius (longer − shorter side) meets it at E.',
      'Extending the line to the circle gives D. The sums of opposite sides agree, so a circle fits inside.'][idx];
  };
  /* ---- frame (shared by the imoB diagrams; each file is self-contained) ---- */
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
