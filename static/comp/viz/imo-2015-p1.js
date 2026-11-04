/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2015-p1. */
(window.CompViz = window.CompViz || {})['imo-2015-p1'] = function (el, api) {
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
  function tri(P, A, B, C, f, k) { return pa(poly([P(A), P(B), P(C)], 1), k || null, k ? 1.5 : null, f); }
  V.aria = 'Balanced point sets: for odd n a regular polygon, for even n a center point with points on a circle in pairs sixty degrees apart. For a chosen pair of points, a third point of the set is equally far from both, shown by a circle through the pair.';
  var n = 7, k = 0;
  function build() {
    var P = [], i; if (n % 2) { for (i = 0; i < n; i++) P.push(G.dir(M.PI / 2 + 2 * M.PI * i / n)); return P; }
    P.push([0, 0]); [0, 60, 120].forEach(function (a) { P.push(G.dir(a * M.PI / 180)); });
    var m = (n - 4) / 2; for (i = 0; i < m; i++) { var t = 128 + 44 * (m > 1 ? i / (m - 1) : 0.5); P.push(G.dir(t * M.PI / 180), G.dir((t + 60) * M.PI / 180)); }
    return P;
  }
  function pairs(P) { var r = []; for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) r.push([i, j]); return r; }
  V.reset = function () { k = 0; }; V.step = function () { k++; }; V.back = function () { k = M.max(0, k - 1); }; V.final = function () { };
  V.sliders = [['n', 3, 10, 1, function () { return n; }, function (v) { n = v; k = 0; }]];
  V.draw = function (c, L) {
    var P = build(), pr = pairs(P), q = pr[k % pr.length], A = P[q[0]], B = P[q[1]], C = null, s = '', T = fitter([[-1.15, -1.15], [1.15, 1.15]], 24, 32, 616, 300);
    P.forEach(function (X, i) { if (C === null && i !== q[0] && i !== q[1] && M.abs(G.dist(X, A) - G.dist(X, B)) < 1e-9) C = X; });
    if (n % 2 === 0) s += CC(T, [0, 0], 1, c.muted, 1, '4 4');
    if (C) s += CC(T, C, G.dist(C, A), c.teal, 2) + LN(T, C, A, c.gold, 2.5) + LN(T, C, B, c.gold, 2.5);
    P.forEach(function (X) { s += ci(T(X), 6, X === A || X === B ? c.red : X === C ? c.gold : c.ink); });
    L('f', 20, 336, (n % 2 ? '\\text{regular } ' + n + '\\text{-gon: balanced and centre-free}' : n + '\\text{ points: balanced, but no centre-free set exists}'), c.ink, 'l');
    return s;
  };
  V.cap = function () { var pr = pairs(build()); return 'Pair ' + (k % pr.length + 1) + ' of ' + pr.length + ' (red): the gold point is equally far from both. Press Step for the next pair.'; };
  V.H = 360;
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
