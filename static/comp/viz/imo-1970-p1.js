/* Our own diagram for the Teddy Rook Book IMO solutions guide: imo-1970-p1. */
(window.CompViz = window.CompViz || {})['imo-1970-p1'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 380;
  V.aria = 'A triangle ABC with a point M sliding along AB. For the two smaller triangles AMC and BMC the incircle and the excircle on the far side of AB are drawn, and the products of radius ratios are shown to match the ratio for the whole triangle.';
  var A = [0, 0], B = [6, 0], C = [2.3, 4.6], t = 0.42, T = 0;
  function circ(P, Q, R) { // incircle and the excircle opposite R (touching side PQ)
    var a = G.dist(Q, R), b = G.dist(R, P), c = G.dist(P, Q), s = (a + b + c) / 2, K = M.abs(G.cr(G.sub(Q, P), G.sub(R, P))) / 2;
    var I = G.mul(G.add(G.add(G.mul(P, a), G.mul(Q, b)), G.mul(R, c)), 1 / (a + b + c));
    var J = G.mul(G.sub(G.add(G.mul(P, a), G.mul(Q, b)), G.mul(R, c)), 1 / (a + b - c));
    return { I: I, r: K / s, J: J, q: K / (s - c) };
  }
  V.sliders = [['M on AB', 0.25, 0.75, 0.01, function () { return t; }, function (v) { t = v; }]];
  V.advance = function (dt) { T += dt; t = 0.5 + 0.25 * M.sin(T * 0.6); };
  V.final = function () { t = 0.42; };
  V.draw = function (c, L) {
    var Mp = [B[0] * t, 0], k1 = circ(A, Mp, C), k2 = circ(Mp, B, C), k = circ(A, B, C);
    var f = fitter([[-0.6, -6.6], [6.6, 4.8]], 20, 12, 400, V.H - 12), s = '', S = f.s;
    s += pa(poly([f(A), f(B), f(C)], 1), c.ink, 2, c.greenSoft);
    s += ln(f(C), f(Mp), c.ink, 1.5, '5 4') + ln(f([-0.4, 0]), f([6.4, 0]), c.grid, 1.2);
    s += ci(f(k1.I), k1.r * S, null, c.blue, 2) + ci(f(k2.I), k2.r * S, null, c.red, 2);
    s += ci(f(k1.J), k1.q * S, null, c.blue, 2, '6 4') + ci(f(k2.J), k2.q * S, null, c.red, 2, '6 4');
    s += dot(f(Mp), c.ink, 5);
    s += tx(G.add(f(A), [-10, 4]), 'A', c.ink, 15, 'end') + tx(G.add(f(B), [10, 4]), 'B', c.ink, 15, 'start') + tx(G.add(f(C), [0, -10]), 'C', c.ink, 15) + tx(G.add(f(Mp), [0, -10]), 'M', c.ink, 15);
    var p = (k1.r * k2.r) / (k1.q * k2.q), w = k.r / k.q;
    L('a', 425, 50, '\\tfrac{r_1}{q_1}=' + (k1.r / k1.q).toFixed(4), c.blue, 'l');
    L('b', 425, 100, '\\tfrac{r_2}{q_2}=' + (k2.r / k2.q).toFixed(4), c.red, 'l');
    L('c', 425, 150, '\\tfrac{r_1r_2}{q_1q_2}=' + p.toFixed(4), c.ink, 'l');
    L('d', 425, 195, '\\tfrac{r}{q}=' + w.toFixed(4), c.green, 'l');
    L('e', 425, 255, '\\tfrac{\\rho}{\\rho\'}=\\tan\\tfrac\\alpha2\\tan\\tfrac\\beta2', c.muted, 'l');
    return s;
  };
  V.cap = function () { return 'Solid circles: incircles of AMC (blue) and BMC (red). Dashed: their excircles below AB. As M slides, each ratio changes but the product stays equal to r/q.'; };
  /* ---- frame (shared frame; each file is self-contained) ---- */
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
