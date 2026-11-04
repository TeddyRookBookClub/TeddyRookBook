/* Our own visualization for the Teddy Rook Book IMO solutions guide: imo-1986-p4. */
(window.CompViz = window.CompViz || {})['imo-1986-p4'] = function (el, api) {
  'use strict';
  var D = document, NS = 'http://www.w3.org/2000/svg', M = Math, W = 640, V = { H: 360, aria: '' };
  V.H = 400;
  V.aria = 'A regular polygon with a copy of the triangle from the center to one side. The copy slides so its two base corners run around the boundary; its apex traces a star of short segments from the center, one pointing away from each vertex.';
  var n = 5, t = 0, trail = [], R = 158, cx = 320, cy = 200;
  function P(j) { var a = -M.PI / 2 + 2 * M.PI * j / n; return [cx + R * M.cos(a), cy + R * M.sin(a)]; }
  function unit(a, b) { var dx = b[0] - a[0], dy = b[1] - a[1], d = M.hypot(dx, dy); return [dx / d, dy / d]; }
  function state(tt) {
    var th = 2 * M.PI / n, s = 2 * R * M.sin(M.PI / n), k = M.floor(tt) % n, phi = (tt - M.floor(tt)) * th;
    var Vv = P(k), u1 = unit(Vv, P(k - 1)), u2 = unit(Vv, P(k + 1));
    var vy = s * M.sin(th - phi) / M.sin(th), vz = s * M.sin(phi) / M.sin(th);
    var Y = [Vv[0] + vy * u1[0], Vv[1] + vy * u1[1]], Z = [Vv[0] + vz * u2[0], Vv[1] + vz * u2[1]];
    var mx = (Y[0] + Z[0]) / 2, my = (Y[1] + Z[1]) / 2, h = (s / 2) / M.tan(th / 2), nx = -(Z[1] - Y[1]) / s, ny = (Z[0] - Y[0]) / s;
    if ((cx - mx) * nx + (cy - my) * ny < 0) { nx = -nx; ny = -ny; }
    return { V: Vv, Y: Y, Z: Z, X: [mx + h * nx, my + h * ny] };
  }
  V.reset = function () { t = 0; trail = []; };
  V.advance = function (dt) { t += dt * 0.55; var st = state(t); trail.push(st.X); if (t >= n) { t = n - 1e-6; return false; } };
  V.done = function () { return t >= n - 1e-3; };
  V.final = function () { trail = []; for (var i = 0; i <= 60 * n; i++) trail.push(state(i / 60 * (n - 1e-6)).X); t = 0.42; };
  V.step = function () { var tgt = M.min(n - 1e-6, M.floor(t + 1e-9) + 1); while (t < tgt) { t = M.min(tgt, t + 0.01); trail.push(state(t).X); } };
  V.buttons = [['n − 1', function () { n = M.max(5, n - 1); V.reset(); }], ['n + 1', function () { n = M.min(9, n + 1); V.reset(); }]];
  V.draw = function (c, L) {
    var s = '', pts = [], i, len = R * (1 / M.cos(M.PI / n) - 1);
    for (i = 0; i < n; i++) pts.push(P(i));
    s += pa(poly(pts, 1), c.ink, 2, c.grid);
    for (i = 0; i < n; i++) { var u = unit(P(i), [cx, cy]); s += ln(cx, cy, cx + u[0] * len, cy + u[1] * len, c.muted, 1.5, '4 4'); }
    if (trail.length > 1) s += pa(poly(trail), c.red, 3);
    var st = state(t);
    s += pa(poly([st.X, st.Y, st.Z], 1), c.blue, 2.5, c.blueSoft);
    s += ci(st.Y[0], st.Y[1], 5, c.blue) + ci(st.Z[0], st.Z[1], 5, c.blue) + ci(st.X[0], st.X[1], 6, c.red) + ci(cx, cy, 3.5, c.ink);
    s += ci(st.V[0], st.V[1], 9, 'none', c.gold, 2);
    L('o', cx - 14, cy + 14, 'O', c.ink); L('x', st.X[0] + 14, st.X[1] - 12, 'X', c.red);
    L('y', st.Y[0] + (st.Y[0] < cx ? -14 : 14), st.Y[1], 'Y', c.blue); L('z', st.Z[0] + (st.Z[0] < cx ? -14 : 14), st.Z[1], 'Z', c.blue);
    L("f", 16, 382, '|OX|_{\\max}=R\\Big(\\dfrac{1}{\\cos(\\pi/' + n + ')}-1\\Big)', c.ink, 'l');
    return s;
  };
  V.cap = function () { return 'n = ' + n + '. Y and Z ride on the two sides at the circled vertex; X (red) slides along the line through that vertex and O, out past O and back. The dashed star is the whole locus.'; };
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
