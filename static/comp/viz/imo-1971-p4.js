/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1971-p4. */
(window.CompViz = window.CompViz || {})['imo-1971-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 330, aria: '' };
  V.aria = 'Five faces of a tetrahedron laid flat in a strip: DAB, ABC, BCD, CDA and DAB again. The last copy is a slide of the first. Horizontal segments from a point X on the first edge AB to its copy on the last one show closed paths; for a middle range of X they cross all edges in order, and all have the same length.';
  var P = { A1: [0, 0], B1: [0.5259, -2.2396], C: [1.9765, -0.2596], Dp: [2.5024, -1.4969], A2: [3.953, 0], B2: [4.4789, -2.2396], D1: [-1.4507, -1.4969] };
  var t0 = 0.116, t1 = 0.668, t = 0.4, dir = 1, sc = 98;
  function S(p) { return [178 + p[0] * sc, 52 - p[1] * sc]; }
  function lerp(a, b, s) { return [a[0] + s * (b[0] - a[0]), a[1] + s * (b[1] - a[1])]; }
  function hit(y, a, b) { var s = (y - a[1]) / (b[1] - a[1]); return s > 0 && s < 1 ? lerp(a, b, s) : null; }
  V.reset = function () { t = 0.03; dir = 1; };
  V.advance = function (dt) { t += dir * dt * 0.12; if (t > 0.97) { t = 0.97; dir = -1; } if (t < 0.03) { t = 0.03; dir = 1; } };
  V.step = function () { t += 0.08; if (t > 0.97) t = 0.03; };
  V.final = function () { t = 0.4; };
  V.draw = function (c, L) {
    var s = '', q = {}, k;
    for (k in P) q[k] = S(P[k]);
    var tris = [['D1', 'A1', 'B1', c.grid], ['A1', 'B1', 'C', c.blueSoft], ['B1', 'C', 'Dp', c.orangeSoft], ['C', 'Dp', 'A2', c.purpleSoft], ['Dp', 'A2', 'B2', c.grid]];
    tris.forEach(function (T) { s += pa(poly([q[T[0]], q[T[1]], q[T[2]]], 1), c.axis, 1.5, T[3]); });
    s += ln(q.A1[0], q.A1[1], q.B1[0], q.B1[1], c.ink, 3) + ln(q.A2[0], q.A2[1], q.B2[0], q.B2[1], c.ink, 3);
    var X = lerp(P.A1, P.B1, t), Xp = [X[0] + P.A2[0], X[1]], good = t > t0 && t < t1, x = S(X), xp = S(Xp);
    s += ln(x[0], x[1], xp[0], xp[1], good ? c.green : c.red, 3, good ? '' : '7 5');
    if (good) [['B1', 'C'], ['C', 'Dp'], ['Dp', 'A2']].forEach(function (e) { var h = hit(X[1], P[e[0]], P[e[1]]); if (h) { h = S(h); s += ci(h[0], h[1], 4, c.green); } });
    s += ci(x[0], x[1], 5, c.ink) + ci(xp[0], xp[1], 5, c.ink);
    [['A1', 'A', 0, -13], ['B1', 'B', 0, 15], ['C', 'C', 0, -13], ['Dp', 'D', 0, 15], ['A2', 'A', 0, -13], ['B2', 'B', 0, 15], ['D1', 'D', -12, 6]].forEach(function (l) { L('p' + l[0], q[l[0]][0] + l[2], q[l[0]][1] + l[3], l[1], c.ink); });
    L('X', x[0] - 14, x[1] - 2, 'X', c.ink); L('Xp', xp[0] + 16, xp[1] - 2, "X'", c.ink);
    L('f', 320, 312, good ? '\\text{closed path, length } |XX\'| = 2\\,AC\\sin\\tfrac{\\alpha}{2}' : '\\text{this segment leaves the strip: not a path}', good ? c.green : c.red);
    return s;
  };
  V.cap = function () { return 'The strip holds the faces ABC, BCD, CDA (colored) between two copies of DAB (gray). Here the angle sums are equal, so the last copy is a pure slide of the first. Each horizontal segment X→X′ that stays in the strip folds up to a shortest closed path.'; };
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
