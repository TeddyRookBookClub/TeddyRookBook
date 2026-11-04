/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1997-p2. */
(window.CompViz = window.CompViz || {})['imo-1997-p2'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 400;
  V.aria = 'A triangle ABC in its circumcircle with A the smallest angle. A point U moves along arc BC. Reflecting line AU in the perpendicular bisectors of AB and AC gives two equal chords BX and CY that cross at T, and AU always equals TB plus TC.';
  var cx = 320, cy = 195, R = 170, tA = -1.75, tB = 2.3, tC = 0.85, u = 0.35, dir = 1;
  function at(t) { return [cx + R * M.cos(t), cy - R * M.sin(t)]; }
  function X(p, q, r, s) { var d1x = q[0] - p[0], d1y = q[1] - p[1], d2x = s[0] - r[0], d2y = s[1] - r[1], den = d1x * d2y - d1y * d2x, k = ((r[0] - p[0]) * d2y - (r[1] - p[1]) * d2x) / den; return [p[0] + k * d1x, p[1] + k * d1y]; }
  function dd(p, q) { return M.hypot(p[0] - q[0], p[1] - q[1]); }
  function geo() {
    var tU = tC + (tB - tC) * u, A = at(tA), B = at(tB), C = at(tC), U = at(tU);
    var Xp = at(tA + tB - tU), Yp = at(tA + tC - tU);
    var mab = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], mac = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
    var Vp = X(mab, [mab[0] + (A[1] - B[1]), mab[1] - (A[0] - B[0])], A, U), Wp = X(mac, [mac[0] + (A[1] - C[1]), mac[1] - (A[0] - C[0])], A, U);
    return { A: A, B: B, C: C, U: U, X: Xp, Y: Yp, V: Vp, W: Wp, T: X(B, Xp, C, Yp), mab: mab, mac: mac };
  }
  V.reset = function () { u = 0.35; dir = 1; };
  V.advance = function (dt) { u += dir * dt * 0.18; if (u > 0.92) { u = 0.92; dir = -1; } if (u < 0.08) { u = 0.08; dir = 1; } };
  V.step = function () { u += 0.1; if (u > 0.92) u = 0.08; };
  V.final = function () { u = 0.35; };
  V.draw = function (c, L) {
    var g = geo(), s = ci(cx, cy, R, 'none', c.axis, 1.5);
    s += pa(poly([g.A, g.B, g.C], 1), c.ink, 2, c.grid);
    s += ln(g.A[0], g.A[1], g.U[0], g.U[1], c.blue, 3);
    s += ln(g.B[0], g.B[1], g.X[0], g.X[1], c.muted, 1.5, '5 4') + ln(g.C[0], g.C[1], g.Y[0], g.Y[1], c.muted, 1.5, '5 4');
    s += ln(g.mab[0], g.mab[1], g.V[0], g.V[1], c.purple, 1.2, '3 3') + ln(g.mac[0], g.mac[1], g.W[0], g.W[1], c.purple, 1.2, '3 3');
    s += ln(g.B[0], g.B[1], g.T[0], g.T[1], c.red, 3) + ln(g.C[0], g.C[1], g.T[0], g.T[1], c.orange, 3) + ln(g.T[0], g.T[1], g.X[0], g.X[1], c.orange, 3, '2 5');
    [['A', g.A, c.ink], ['B', g.B, c.ink], ['C', g.C, c.ink], ['U', g.U, c.blue], ['X', g.X, c.muted], ['Y', g.Y, c.muted], ['V', g.V, c.purple], ['W', g.W, c.purple], ['T', g.T, c.red]].forEach(function (q) {
      s += ci(q[1][0], q[1][1], 4.5, q[2]);
      var dx = q[1][0] - cx, dy = q[1][1] - cy, d = M.hypot(dx, dy) || 1, o = { T: [0, 18], V: [-15, -4], W: [15, -4] }[q[0]];
      if (o) L(q[0], q[1][0] + o[0], q[1][1] + o[1], q[0], q[2]); else L(q[0], q[1][0] + dx / d * 15, q[1][1] + dy / d * 15, q[0], q[2]);
    });
    var sc = 1 / 40;
    L('f', 14, 386, 'AU=' + (dd(g.A, g.U) * sc).toFixed(2) + '\\qquad TB+TC=' + ((dd(g.T, g.B) + dd(g.T, g.C)) * sc).toFixed(2), c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'Reflecting AU in the purple bisectors gives the dashed chords BX and CY, both as long as AU. TC equals TX (orange), so TB + TC is the whole chord BX.'; };
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
