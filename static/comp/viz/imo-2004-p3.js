/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-2004-p3. */
(window.CompViz = window.CompViz || {})['imo-2004-p3'] = function (el, api) {
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
  V.aria = 'A hook on a grid with its pocket cell. Four ways a second hook could fill the pocket are shown: one overlaps, one leaves a cell walled in, and two work, giving a 3 by 4 rectangle or a step-shaped 12-cell piece. A last frame tiles a 7 by 12 rectangle with hook pairs.';
  stepper(5);
  var H = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0]];
  var CASES = [null,
    [[1, 1], [2, 1], [2, 0], [2, -1]],
    [[1, 1], [2, 1], [2, 2], [2, 3], [1, 3], [0, 3]],
    [[1, 1], [2, 1], [3, 1], [3, 2], [3, 3], [2, 3]],
    [[1, 1], [2, 1], [3, 1], [3, 0], [3, -1], [2, -1]]];
  var CAPS = ['A hook (teal) and its pocket c (gold): three of the pocket’s neighbors are in the hook, so the hook filling c must leave c downward.',
    'Pattern 1, 2, 2, bending left in the picture: it runs into the first hook. Impossible.',
    'Pattern 1, 2, 2, bending right: each hook fills the other’s pocket, and together they make a 3 × 4 rectangle.',
    'Pattern 2, 2, 1, bending right: the red cell is walled in on all four sides, so nothing can cover it. Impossible.',
    'Pattern 2, 2, 1, bending left: again each fills the other’s pocket, giving a 12-cell step.',
    'So hooks pair up. A 7 × 12 rectangle: a strip of 3 × 4 blocks and a strip of 4 × 3 blocks, each block two hooks.'];
  var F = ['', '\\text{overlap}', '3\\times4', '\\text{dead cell}', '\\text{step}', '7\\times12:\\ 7=3+4'];
  function cell(x0, y0, z, r, q, f, k) { return re(x0 + q * z, y0 + r * z, z, z, f, k); }
  V.draw = function (c, L) {
    var s = '', z, x0, y0, i;
    if (st < 5) {
      z = 46; x0 = 320 - 1.5 * z; y0 = 60;
      for (var r = -1; r <= 4; r++) for (var q = -2; q <= 4; q++) s += cell(x0, y0, z, r, q, 'none', c.grid);
      H.forEach(function (p) { s += cell(x0, y0, z, p[0], p[1], c.teal + '66', c.teal); });
      var K = CASES[st];
      if (K) K.forEach(function (p) {
        var bad = H.some(function (h) { return h[0] === p[0] && h[1] === p[1]; });
        s += cell(x0, y0, z, p[0], p[1], bad ? c.red + '88' : c.orange + '66', bad ? c.red : c.orange);
      });
      if (st === 3) s += cell(x0, y0, z, 2, 2, c.red + '88', c.red) + tx([x0 + 2.5 * z, y0 + 2.5 * z + 6], '✕', c.red, 20, 'middle', 700);
      s += re(x0 + z + 4, y0 + z + 4, z - 8, z - 8, 'none', c.gold, 3) + tx([x0 + 1.5 * z, y0 + 1.5 * z + 5], 'c', c.ink, 16, 'middle', 700);
      if (st === 0) s += re(x0 + z + 4, y0 + 2 * z + 4, z - 8, z - 8, 'none', c.muted, 2) + tx([x0 + 1.5 * z, y0 + 2.5 * z + 5], 'd', c.muted, 15);
    } else {
      z = 28; x0 = 320 - 6 * z; y0 = 40;
      var cols = [c.teal, c.orange, c.purple, c.gold];
      for (i = 0; i < 3; i++) { // 3 x 4 blocks in rows 0-2
        var a = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0]], b = [[1, 1], [2, 1], [2, 2], [2, 3], [1, 3], [0, 3]];
        a.forEach(function (p) { s += cell(x0, y0, z, p[0], p[1] + 4 * i, cols[i % 2] + 'aa', c.panel); });
        b.forEach(function (p) { s += cell(x0, y0, z, p[0], p[1] + 4 * i, cols[2 + i % 2] + 'aa', c.panel); });
      }
      for (i = 0; i < 4; i++) { // 4 x 3 blocks in rows 3-6 (transposed)
        var a2 = [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0]], b2 = [[1, 1], [2, 1], [2, 2], [2, 3], [1, 3], [0, 3]];
        a2.forEach(function (p) { s += cell(x0, y0, z, 3 + p[1], p[0] + 3 * i, cols[2 + i % 2] + 'aa', c.panel); });
        b2.forEach(function (p) { s += cell(x0, y0, z, 3 + p[1], p[0] + 3 * i, cols[i % 2] + 'aa', c.panel); });
      }
      for (i = 0; i < 3; i++) s += re(x0 + 4 * i * z, y0, 4 * z, 3 * z, 'none', c.ink);
      for (i = 0; i < 4; i++) s += re(x0 + 3 * i * z, y0 + 3 * z, 3 * z, 4 * z, 'none', c.ink);
    }
    L('f', 20, 336, F[st], c.ink, 'l');
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
